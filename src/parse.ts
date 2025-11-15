import { Ascii, asciiToByte } from './ascii'
import { kRegisterMetadataKey, kPrefixMetadataKey } from './symbols'
import { CmdBase } from './cmd'
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

type FnLookahead = {
  fns: any[]
  skip: number
}

export function registerMultiFn(prefix: Ascii[], config: { skip: number, fn: number }): Decorator {
  return (value, context) => {
    assert(context.kind === 'class')
    assert(value)
    let obj = getFromTree(prefix)
    if (!obj) {
      obj = {
        fns: [],
        skip: config.skip
      }
    }
    assert(obj.skip === config.skip,
      `skip value should be fixed for a given multi-function command.
      Tried to define skip value of: ${config.skip}
      Previously defined skip value: ${obj.skip}`)
    obj.fns[config.fn] = value
    addToTree(prefix, obj)
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
  let cur: any = kPrefixTree
  let i = 0
  while (i < buf.length) {
    const b = buf[i]
    if (!(b in cur)) {
      throw new ParseError(`unexpected token: ${b}`)
    }
    cur = cur[b]
    if (Array.isArray(cur)) { // descend another level in the tree
      i++
    } else if (cur.desc) { // cur is a cmd ctor
      const ctor = cur
      const [instance, bytesRead] = ctor.from(buf.subarray(i + 1))
      cmds.push(instance)
      i += bytesRead + 1
      cur = kPrefixTree
    } else { // cur is a FnLookahead that looks at the fn byte and dispatches to the appropriate cmd ctor
      const lookahead = cur as FnLookahead
      const subBuf = buf.subarray(i + 1)
      const fn = subBuf[lookahead.skip]
      const ctor = lookahead.fns[fn]
      const [instance, bytesRead] = ctor.from(subBuf)
      cmds.push(instance)
      i += bytesRead + 1
      cur = kPrefixTree
    }
  }
  if (cur !== kPrefixTree) {
    // TODO print out the current unfinished command
    throw new ParseError(`unexpected end of buffer`)
  }
  return cmds
}

