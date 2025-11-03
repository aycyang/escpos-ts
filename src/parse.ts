import { Ascii, asciiToByte } from './ascii'
import { kPreludeMetadataKey } from './symbols'

// TODO eventually, this will be made obsolete by the Decorator Metadata
// feature, which is one stage away from standardization at the time of
// writing: https://github.com/tc39/proposal-decorator-metadata
import 'reflect-metadata'

const kParseTree = []

class ParseError extends Error {}

export function register(prelude: Ascii[]) {
  return target => {
    let cur = kParseTree
    let i = 0
    while (i < prelude.length - 1) {
      const b = asciiToByte(prelude[i])
      cur[b] ??= []
      cur = cur[b]
      i++
    }
    const b = asciiToByte(prelude[i])
    cur[b] = target
    Reflect.defineMetadata(kPreludeMetadataKey, prelude, target)
  }
}

export function parse(buf: Buffer) {
  const cmds = []
  let cur = kParseTree
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
      cur = kParseTree
    } else {
      i++
    }
  }
  if (cur !== kParseTree) {
    throw new ParseError(`unexpected end of buffer`)
  }
  return cmds
}

