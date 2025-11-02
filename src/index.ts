import assert from 'node:assert'
import { Ascii, asciiToByte } from './ascii'

// TODO eventually, this will be made obsolete by the Decorator Metadata
// feature, which is one stage away from standardization at the time of
// writing: https://github.com/tc39/proposal-decorator-metadata
import 'reflect-metadata'

// TODO this can probably be made non-global
const kParseTree = []

// --- DECORATORS ---

const kSerialMetadataKey = Symbol('serial')
const kPreludeMetadataKey = Symbol('prelude')
const kRegisterMetadataKey = Symbol('register')

type Decorator = (target, propertyKey: string) => (void)
type UnsignedInt = 'u8' | 'u16' | 'u32'
type VariableSize = { member: string, offset?: number }
type SerialFormat = UnsignedInt | VariableSize

function compose(decorators: Decorator[]): Decorator {
  return (target, propertyKey) => {
    for (const decorator of decorators) {
      decorator(target, propertyKey)
    }
  }
}

function register(target, propertyKey: string) {
  const memberList = Reflect.getMetadata(kRegisterMetadataKey, target) ?? []
  memberList.push(propertyKey)
  Reflect.defineMetadata(kRegisterMetadataKey, memberList, target)
}

function serial(arg: SerialFormat) {
  return compose([register, Reflect.metadata(kSerialMetadataKey, arg)])
}

function registerCmd(prelude: Ascii[], target) {
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
}

function prelude(arg: Ascii[]) {
  return target => {
    registerCmd(arg, target)
    Reflect.defineMetadata(kPreludeMetadataKey, arg, target)
  }
}

// --- END OF DECORATORS ---

class CmdBase {
  static desc: string

  serialize(): Buffer {
    const prelude = Reflect.getMetadata(kPreludeMetadataKey, this.constructor)
    const bytes = prelude.map(asciiToByte)
    const members = Reflect.getMetadata(kRegisterMetadataKey, this)
    for (const member of members) {
      const format = Reflect.getMetadata(kSerialMetadataKey, this, member)
      bytes.push(...toBytesLE(this[member], format))
    }
    return Buffer.from(bytes)
  }

  evalFormat(format: SerialFormat): UnsignedInt | number {
    switch (format) {
      case 'u32':
      case 'u16':
      case 'u8':
        return format
      default:
        return this[format.member] + (format.offset ?? 0)
    }
  }

  // TODO throw parse error if end of buffer is reached prematurely
  static from(buf: Buffer): [any, number] {
    // NOTE prelude has already been consumed at this point; just populate the
    // args now.
    const instance = new this()
    const members = Reflect.getMetadata(kRegisterMetadataKey, this.prototype)
    if (!members) {
      return [instance, 0]
    }
    let offset = 0
    for (const member of members) {
      const format = Reflect.getMetadata(kSerialMetadataKey, this.prototype, member)
      // TODO there must be a better way to differentiate behavior between buffers and uints
      const normalizedFormat = instance.evalFormat(format)
      const [value, newOffset] = fromBytesLE(buf, normalizedFormat, offset)
      instance[member] = value
      offset = newOffset
    }
    return [instance, offset]
  }


}

@prelude(['ESC', '@'])
export class InitPrinter extends CmdBase {
  static override desc: string = 'Initialize printer'
}

@prelude(['ESC', '*'])
export class SelectBitImageMode extends CmdBase {
  static override desc: string = 'Select bit-image mode'

  @serial('u8')
  m: number

  @serial('u16')
  n: number

  // TODO change type to Uint8Array
  @serial({ member: 'n' })
  d: Buffer

  constructor(m, n, d: Buffer) {
    super()
    // TODO m: replace with string-backed enum
    this.m = m
    // TODO n: infer from buffer length
    this.n = n
    this.d = d
  }

}


function fromBytesLE(buf: Buffer, format: UnsignedInt | number, offset: number): [number | Buffer, number] {
  switch (format) {
    case 'u8':
      return [buf.readUint8(offset), offset + 1]
    case 'u16':
      return [buf.readUint16LE(offset), offset + 2]
    case 'u32':
      return [buf.readUint32LE(offset), offset + 4]
    default:
      return [buf.subarray(offset, offset + format), offset + format]
  }
}

// TODO use UInt8Array instead of Buffer so browsers can use it too without
// needing a polyfill
function toBytesLE(n: any, format: string): number[] {
  let buf: Buffer
  switch (format) {
    case 'u8':
      buf = Buffer.alloc(1)
      buf.writeUInt8(n)
      break
    case 'u16':
      buf = Buffer.alloc(2)
      buf.writeUInt16LE(n)
      break
    case 'u32':
      buf = Buffer.alloc(4)
      buf.writeUInt32LE(n)
      break
    default:
      buf = n
  }
  return Array.from(buf)
}

class ParseError extends Error {}

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
