import { asciiToByte } from './ascii'
import { kSerialMetadataKey, kPrefixMetadataKey, kRegisterMetadataKey } from './symbols'

// TODO eventually, this will be made obsolete by the Decorator Metadata
// feature, which is one stage away from standardization at the time of
// writing: https://github.com/tc39/proposal-decorator-metadata
import 'reflect-metadata'

export class CmdBase {
  static desc: string

  serialize(): Buffer {
    const prefix = Reflect.getMetadata(kPrefixMetadataKey, this.constructor)
    const bytes = prefix.map(asciiToByte)
    const members = Reflect.getMetadata(kRegisterMetadataKey, this) ?? []
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

  static from(buf: Buffer): [any, number] {
    // Assumption: the prefix bytes have already been consumed. The passed-in
    // buffer begins just after the prefix bytes. The buffer may contain more
    // bytes than expected, but any fewer would be unexpected.
    // TODO throw parse error if end of buffer is reached prematurely
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


