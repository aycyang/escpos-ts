import { Buffer } from 'buffer'

import '@tsmetadata/polyfill'
import { asciiToByte } from './ascii'
import { bufToAbbrevString } from './util'
import { kRangeMetadataKey, kSerialMetadataKey, kPrefixMetadataKey, kRegisterMetadataKey } from './symbols'
import { ParseError } from './parse'
import { assert } from './assert'

export class CmdBase {
  static desc: string

  toString(): string {
    const ctor = this.constructor as any
    const fields = Object.keys(this)
    const fieldsAndValues = []
    for (const name of fields) {
      const value = this[name]
      let valueString = value.toString()
      if (value.length) {
        valueString = bufToAbbrevString(value)
      }
      fieldsAndValues.push(`${name}=${valueString}`)
    }
    // TODO explain what each field value means, perhaps with decorators?
    return `${ctor.desc} ( ${fieldsAndValues.join(', ')} )`
  }

  // TODO enforce validate is called before cmd can be used
  validate() {
    const metadata = this.constructor[Symbol.metadata]
    assert(metadata)
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields ?? {})) {
      const value: number | Buffer = this[fieldName]
      const ranges: any[] = fieldMetadata.ranges as any[] ?? []
      if (typeof value === 'number') {
        if (!ranges.some(range => range.contains(value))) {
          throw new ParseError(`Parsed value ${value} for field '${fieldName}' is not within a valid range.\nValid ranges: ${ranges ? ranges.map(range => range.toString()).join(', ') : '<no ranges specified>'}`)
        }
      } else { // Buffer
        const offendingIndex = value.findIndex(byte => !ranges.some(range => range.contains(byte)))
        if (offendingIndex !== -1) {
          throw new ParseError(`Parsed buffer for field '${fieldName}' has a byte ${value[offendingIndex]} at index ${offendingIndex} that is not within a valid range.\nValid ranges: ${ranges ? ranges.map(range => range.toString()).join(', ') : '<no ranges specified>'}`)
        }
      }
    }
  }

  serialize(): Buffer {
    const metadata = this.constructor[Symbol.metadata]
    assert(metadata)
    const prefix = metadata.prefix as any[]
    const bytes = prefix.map(asciiToByte)
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields ?? {})) {
      bytes.push(...toBytesLE(this[fieldName], fieldMetadata.serial))
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

  /**
   * Assumption: the prefix bytes have already been consumed. The passed-in
   * buffer begins just after the prefix bytes. The buffer may contain more
   * bytes than expected, but any fewer would be unexpected.
   *
   * TODO throw parse error if end of buffer is reached prematurely
   */
  static from(buf: Buffer): [any, number] {
    const metadata = this[Symbol.metadata]
    assert(metadata)
    // The goal here is to create an object with the subclass's prototype, but
    // without invoking the subclass's constructor. The object's prototype must
    // be that of the subclass so that it can access its reflection metadata in
    // instance methods such as `serialize()`. The constructor must be bypassed
    // because subclasses may define arbitrary constructors which cannot be
    // handled generically. To achieve this goal, `Object.create()` is used
    // here.
    const instance = Object.create(this.prototype)
    if (!metadata.fields) {
      return [instance, 0]
    }
    let offset = 0
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields ?? {})) {
      // TODO there must be a better way to differentiate behavior between buffers and uints
      const normalizedFormat = instance.evalFormat(fieldMetadata.serial)
      const [value, newOffset] = fromBytesLE(buf, normalizedFormat, offset)

      instance[fieldName] = value
      offset = newOffset
    }
    instance.validate()
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


