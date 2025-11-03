import { Ascii, asciiToByte } from './ascii'
import { kPrefixMetadataKey } from './symbols'
import { CmdBase } from './cmd'

// TODO eventually, this will be made obsolete by the Decorator Metadata
// feature, which is one stage away from standardization at the time of
// writing: https://github.com/tc39/proposal-decorator-metadata
import 'reflect-metadata'

const kPrefixTree = []

class ParseError extends Error {}

/**
 * Populates the prefix tree at the path specified by the prefix. The leaf
 * node is set to the constructor of the class decorated by the returned
 * decorator.
 */
export function register(prefix: Ascii[]): Decorator {
  return target => {
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
    Reflect.defineMetadata(kPrefixMetadataKey, prefix, target)
  }
}

/**
 * Parses a buffer into a list of ESC/POS commands.
 */
export function parse(buf: Buffer): CmdBase[] {
  const cmds: CmdBase[] = []
  let cur = kPrefixTree
  let i = 0
  while (i < buf.length) {
    const b = buf[i]
    if (!(b in cur)) {
      throw new ParseError(`unexpected token: ${b}`)
    }
    cur = cur[b]
    if (typeof cur === 'function') { // ctor
      const ctor = cur as any
      const [instance, bytesRead] = ctor.from(buf.subarray(i + 1))
      cmds.push(instance)
      i += bytesRead + 1
      cur = kPrefixTree
    } else {
      i++
    }
  }
  if (cur !== kPrefixTree) {
    // TODO print out the current unfinished command
    throw new ParseError(`unexpected end of buffer`)
  }
  return cmds
}

