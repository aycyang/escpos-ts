import { Ascii, asciiToByte } from './ascii'
import { kRegisterMetadataKey, kPrefixMetadataKey } from './symbols'
import { CmdBase } from './cmd'
import { byteToHex } from './util'
import { assert } from './assert'


const kPrefixTree = []

export class ParseError extends Error {}

function getFromTree(prefix: Ascii[]): any {
  let cur = kPrefixTree
  let i = 0
  while (i < prefix.length) {
    const b = asciiToByte(prefix[i])
    if (!(b in cur)) {
      return undefined
    }
    cur = cur[b]
    i++
  }
  return cur
}

function addToTree(prefix: Ascii[], target) {
  let cur = kPrefixTree
  let i = 0
  while (i < prefix.length - 1) {
    const b = asciiToByte(prefix[i])
    cur[b] ??= []
    cur = cur[b]
    i++
  }
  const b = asciiToByte(prefix[i])
  cur[b] = target
}

class FnLookahead {
  fns: any[]
  skip: number
  constructor(skip: number) {
    this.fns = []
    this.skip = skip
  }
  put(fn: number, ctor: Function) {
    this.fns[fn] = ctor
  }
}

export function registerMultiFn(prefix: Ascii[], config: { skip: number, fn: number }): Decorator {
  return (value, context) => {
    assert(context.kind === 'class')
    assert(value)
    let lookahead = getFromTree(prefix)
    if (!lookahead) {
      lookahead = new FnLookahead(config.skip)
    }
    assert(lookahead.skip === config.skip,
      `skip value should be fixed for a given multi-function command.
      Tried to define skip value of: ${config.skip}
      Previously defined skip value: ${lookahead.skip}`)
    lookahead.put(config.fn, value)
    addToTree(prefix, lookahead)
    context.metadata.prefix = prefix
  }
}

/**
 * Populates the prefix tree at the path specified by the prefix. The leaf
 * node is set to the constructor of the class decorated by the returned
 * decorator.
 */
export function register(prefix: Ascii[]): Decorator {
  return (value, context) => {
    assert(context.kind === 'class')
    assert(value)
    addToTree(prefix, value)
    context.metadata.prefix = prefix
  }
}

// TODO return interface Cmd instead of CmdBase.
/**
 * Parses a buffer into a list of ESC/POS commands.
 */
export function parse(buf: Buffer): CmdBase[] {
  const cmds: CmdBase[] = []
  while (buf.length > 0) {
    // Traverse parse tree until a leaf node is reached.
    let curNode: any = kPrefixTree
    let i = 0
    while(i < buf.length && buf[i] in curNode) {
      curNode = curNode[buf[i]]
      i++
    }

    // If curNode isn't a leaf node by now, something went wrong with the
    // parse.
    if (Array.isArray(curNode)) {
      if (i >= buf.length) {
        throw new ParseError(`unexpected end of buffer: ${buf}`)
      }
      throw new ParseError(`unrecognized token: 0x${byteToHex(buf[i])}`)
    }

    // Advance the buffer start pointer to just after the prefix.
    buf = buf.subarray(i)

    // curNode could now be one of two things: (1) a command constructor, or
    // (2) a multi-function command dispatcher. In case of (2), lookahead to
    // the "fn" byte to resolve to the subcommand.
    let cmdClass = curNode
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

