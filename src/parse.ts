import { Ascii, asciiToByte } from './ascii'
import { CmdClass, CmdClassDecorator, CmdBase } from './cmd'
import { byteToHex } from './util'
import { ParseError } from './error'
import { assert } from './assert'

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
  config: { skip: number; fn: number },
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
export function register(prefix: Ascii[]): CmdClassDecorator {
  return (value: CmdClass, context: ClassDecoratorContext) => {
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
    let curNode = kPrefixTree as Node
    let i = 0
    while (i < buf.length && Array.isArray(curNode) && buf[i] in curNode) {
      curNode = curNode[buf[i]]
      i++
    }

    // If curNode isn't a leaf node by now, something went wrong with the
    // parse.
    if (Array.isArray(curNode)) {
      if (i >= buf.length) {
        throw new ParseError(`unexpected end of buffer: ${buf.toString()}`)
      }
      throw new ParseError(`unrecognized token: 0x${byteToHex(buf[i])}`)
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
