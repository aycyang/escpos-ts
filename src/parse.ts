import { Buffer } from 'buffer'

import { Ascii, asciiToByte } from './ascii'
import { CmdBase, CmdClass, CmdClassDecorator } from './cmd'
import { assert } from './assert'
import { ParseError } from './error'

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

type ParseInfo = {
  cmd: CmdBase
  size: number
}

/**
 * Returns a generator that parses bytes one-by-one as they are being passed
 * in as arguments to next(). If the bytes form a valid command, the generator
 * constructs the command and yields it, along with the number of bytes used to
 * construct the command (this number can be used by the caller to determine
 * where the free bytes end and where the command bytes begin). If the bytes
 * form an incomplete command or otherwise do not form a valid command, the
 * generator yields nothing and the caller may continue to pass in bytes.
 *
 * This function is designed for interactive applications. For batch
 * processing, parse() may be faster.
 *
 * This function assumes all command parsers will throw a ParseError if the
 * parameter byte buffer ends prematurely. This property is relied upon to
 * determine when to finally yield the parsed command. If this property is ever
 * untrue for whatever reason, the command will be constructed prematurely with
 * invalid data, and subsequent bytes may also be interpreted incorrectly.
 */
export function* parseGenerator(): Generator<ParseInfo, ParseInfo, number> {
  let nextByte = -1
  while (true) {
    let size = 0
    let curNode = kPrefixTree as Node
    while (Array.isArray(curNode)) {
      nextByte = yield
      if (nextByte in curNode) {
        curNode = curNode[nextByte]
        size++
      } else {
        curNode = kPrefixTree as Node
        size = 0
      }
    }

    const params: number[] = []
    let cmdClass = curNode as CmdClass
    if (curNode instanceof FnLookahead) {
      while (params.length <= curNode.skip) {
        nextByte = yield
        params.push(nextByte)
        size++
      }
      const fnByte = params[curNode.skip]
      if (fnByte in curNode.fns) {
        cmdClass = curNode.fns[fnByte]
      } else {
        continue
      }
    }

    let cmd: CmdBase
    do {
      try {
        ;[cmd] = cmdClass.from(Buffer.from(params))
        break
      } catch (err: unknown) {
        assert(
          err instanceof ParseError,
          `expected ParseError, got ${err.constructor.name}: ${(err as Error).message}`,
        )
        // TODO yield type information of required params so that a client
        // could potentially construct a form
        params.push(yield)
        size++
      }
    } while (true)

    nextByte = yield { cmd, size }
  }
}

/**
 * Parses a buffer into a list of ESC/POS commands.
 */
export function parse(buf: Buffer): Serializable[] {
  const cmds: Serializable[] = []
  while (buf.length > 0) {
    if (!(buf[0] in kPrefixTree)) {
      let last: Bytes
      if (cmds[cmds.length - 1] instanceof Bytes) {
        last = cmds[cmds.length - 1] as Bytes
      } else {
        last = new Bytes()
        cmds.push(last)
      }
      last.push(buf[0])
      buf = buf.subarray(1)
      continue
    }
    // Traverse parse tree until a leaf node is reached.
    let curNode = kPrefixTree as Node
    let i = 0
    while (i < buf.length && Array.isArray(curNode) && buf[i] in curNode) {
      curNode = curNode[buf[i]]
      i++
    }

    // If curNode isn't a leaf node by now, no prefix was recognized.
    // Parse the bytes read so far as free bytes.
    if (Array.isArray(curNode)) {
      if (!(cmds[cmds.length - 1] instanceof Bytes)) {
        cmds.push(new Bytes())
      }
      const last = cmds[cmds.length - 1] as Bytes
      last.push(...buf.subarray(0, i))
      buf = buf.subarray(i)
      continue
    }

    // Advance the buffer start pointer to just after the prefix.
    buf = buf.subarray(i)

    // curNode could now be one of two things: (1) a command constructor, or
    // (2) a multi-function command dispatcher. In case of (2), lookahead to
    // the "fn" byte to resolve to the subcommand.
    let cmdClass = curNode as CmdClass
    if (curNode instanceof FnLookahead) {
      const fn = buf[curNode.skip]
      cmdClass = curNode.fns[fn]
    }

    // cmdClass is now the fully-resolved command constructor.
    const [cmd, remainder] = cmdClass.from(buf)
    cmds.push(cmd)
    buf = remainder
  }
  return cmds
}
