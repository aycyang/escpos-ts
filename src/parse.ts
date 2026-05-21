import { Buffer } from 'buffer'

import { Ascii, asciiToByte } from './ascii'
import { CmdBase, CmdClass, CmdClassDecorator } from './cmd'
import { assert } from './assert'
import { ParseError } from './error'
import { toHexList } from './util'

function toChar(n: number) {
  if (n < 0x20 || n >= 0x80) {
    let hexcode = n.toString(16)
    if (hexcode.length === 1) {
      hexcode = '0' + hexcode
    }
    return `\\x${hexcode}`
  }
  const c = String.fromCharCode(n)
  if (c == '"') {
    return '\\"'
  }
  if (c == '\\') {
    return '\\\\'
  }
  return c
}

export interface Serializable {
  serialize(): Buffer
  toString(): string
}

export class Bytes {
  values: number[]

  constructor(values: number[] = []) {
    this.values = values
  }

  serialize(): Buffer {
    return Buffer.from(this.values)
  }

  toString(): string {
    const str = this.values.map(toChar).join('')
    return `"${str}"`
  }

  push(...args: number[]) {
    this.values.push(...args)
  }

  static from(values: number[]) {
    return new Bytes(values)
  }
}

export class InvalidCmd {
  values: number[]

  constructor(values: number[] = []) {
    this.values = values
  }

  serialize(): Buffer {
    return Buffer.from(this.values)
  }

  toString(): string {
    return `Invalid command: [${toHexList(this.values)}]`
  }

  push(...args: number[]) {
    this.values.push(...args)
  }

  static from(values: number[]) {
    return new InvalidCmd(values)
  }
}

type Node = Node[] | CmdClass | FnLookahead
const kPrefixTree: Node[] = []

function getFromTree(prefix: Ascii[]): Node {
  let curNode: Node = kPrefixTree
  let i = 0
  while (i < prefix.length) {
    if (!Array.isArray(curNode)) return undefined
    const b = asciiToByte(prefix[i])
    curNode = curNode[b]
    i++
  }
  return curNode
}

function addToTree(prefix: Ascii[], target: Node) {
  let curNode: Node = kPrefixTree
  let i = 0
  while (i < prefix.length - 1) {
    if (!Array.isArray(curNode)) return
    const b = asciiToByte(prefix[i])
    curNode[b] ??= []
    curNode = curNode[b]
    i++
  }
  const b = asciiToByte(prefix[i])
  curNode[b] = target
}

class FnLookahead {
  fns: CmdClass[]
  skip: number
  constructor(skip: number) {
    this.fns = []
    this.skip = skip
  }
  put(fn: number, ctor: CmdClass) {
    this.fns[fn] = ctor
  }
}

export function registerMultiFn(
  prefix: Ascii[],
  config: { skip: number; fns: number[] },
): CmdClassDecorator {
  return (value: CmdClass, context: ClassDecoratorContext) => {
    let lookahead = getFromTree(prefix) as FnLookahead
    if (!lookahead) {
      lookahead = new FnLookahead(config.skip)
    }
    assert(
      lookahead.skip === config.skip,
      `skip value should be fixed for a given multi-function command.
      Tried to define skip value of: ${config.skip}
      Previously defined skip value: ${lookahead.skip}`,
    )
    for (const fn of config.fns) {
      lookahead.put(fn, value)
    }
    addToTree(prefix, lookahead)
    context.metadata.prefix = prefix
  }
}

/**
 * Populates the prefix tree at the path specified by the prefix. The leaf
 * node is set to the constructor of the class decorated by the returned
 * decorator.
 */
export function register(prefix: Ascii[]): CmdClassDecorator {
  return (value: CmdClass, context: ClassDecoratorContext) => {
    addToTree(prefix, value)
    context.metadata.prefix = prefix
  }
}

type CmdParamType = {
  name: string
  type: 'u8' | 'u16' | 'u32'
}

type CmdTypeInfo = {
  desc: string
  params: CmdParamType[]
}

export type PartialParseInfo = {
  parsed: Serializable[]
  buffered: Buffer
  error?: Error
  expecting?: CmdTypeInfo // TODO this isn't implemented yet
}

/**
 * Returns a generator that consumes a stream of bytes. Any valid commands in
 * the stream are parsed, constructed, and yielded. Any partial commands are
 * buffered and can be completed in subsequent calls to next().
 */
function* chunkParser(): Generator<PartialParseInfo, PartialParseInfo, Buffer> {
  const parsed: Serializable[] = []
  let buffered: Buffer = Buffer.from([])
  while (true) {
    // If buffer is empty, request more bytes.
    while (buffered.length === 0) {
      buffered = yield { parsed, buffered }
    }

    // Parse any leading free bytes.
    const indexOfFirstCmdByte = buffered.findIndex(
      (byte) => byte in kPrefixTree,
    )
    if (indexOfFirstCmdByte === -1) {
      parsed.push(Bytes.from([...buffered]))
      buffered = Buffer.from([])
      continue
    }

    // A command byte was detected. Parse any leading free bytes.
    if (indexOfFirstCmdByte > 0) {
      parsed.push(Bytes.from([...buffered.subarray(0, indexOfFirstCmdByte)]))
    }

    // Remove the leading free bytes from the buffer.
    buffered = buffered.subarray(indexOfFirstCmdByte)

    // Use the first byte (the detected command byte) to walk down the first
    // level of the tree. Start a pointer at the second byte, to be incremented
    // in the subsequent loop.
    let curNode = kPrefixTree[buffered[0]]
    let curIdx = 1

    // Descend command parse tree.
    while (Array.isArray(curNode)) {
      // If pointer is currently beyond the bounds of the buffer,
      // request more bytes.
      while (buffered.length <= curIdx) {
        const addendum = yield { parsed, buffered }
        buffered = Buffer.concat([buffered, addendum])
      }

      // Descend down parse tree.
      // If branch doesn't exist, curNode becomes undefined.
      curNode = curNode[buffered[curIdx]]

      // Advance pointer in buffer.
      curIdx++
    }

    const prefixLength = curIdx

    if (!curNode) {
      // The branch didn't exist. Add a tombstone and continue parsing.
      parsed.push(InvalidCmd.from([...buffered.subarray(0, prefixLength)]))
      buffered = buffered.subarray(prefixLength)
      continue
    }

    // Resolve command constructor.
    let cmdClass = curNode as CmdClass
    if (curNode instanceof FnLookahead) {
      // If buffer doesn't have enough bytes to perform the lookahead,
      // request more bytes.
      while (buffered.length <= prefixLength + curNode.skip) {
        const error = new ParseError(
          'not enough bytes to perform function number lookahead',
        )
        const addendum = yield { parsed, buffered, error }
        buffered = Buffer.concat([buffered, addendum])
      }
      const fnByte = buffered[prefixLength + curNode.skip]
      if (!(fnByte in curNode.fns)) {
        // TODO double check this error handling is accurate to device
        buffered = buffered.subarray(prefixLength + curNode.skip + 1)
        continue
      }
      cmdClass = curNode.fns[fnByte]
    }

    // Yield errors and consume bytes until command constructor succeeds.
    let cmd: CmdBase
    let remainder: Buffer
    do {
      try {
        ;[cmd, remainder] = cmdClass.from(buffered.subarray(prefixLength))
      } catch (untypedError: unknown) {
        const error = untypedError as Error
        assert(
          error instanceof ParseError,
          `expected ParseError, got ${error.constructor.name}: ${error.message}`,
        )
        // Buffer didn't have enough bytes to construct the command.
        // Request more bytes.
        const addendum = yield { parsed, buffered, error }
        buffered = Buffer.concat([buffered, addendum])
      }
    } while (!cmd)
    parsed.push(cmd)
    buffered = remainder
  }
}

export class Parser {
  generator: Generator<PartialParseInfo, PartialParseInfo, Buffer>
  constructor() {
    this.generator = chunkParser()
    this.generator.next()
  }
  consume(buf: Buffer): PartialParseInfo {
    return this.generator.next(buf).value
  }
}
