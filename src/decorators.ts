import { kSerialMetadataKey, kRegisterMetadataKey, kRangeMetadataKey } from './symbols'
import { assert } from './assert'

type Range2 = number | [ number, number ]

function rangeContains(range: Range2, value: number) {
  if (Array.isArray(range)) {
    return range[0] <= value && value <= range[1]
  }
  return value === range
}

class Range {
  min: number
  max: number
  constructor(min: number, max: number) {
    this.min = min
    this.max = max
  }
  contains(value: number) {
    return this.min <= value && value <= this.max
  }
  toString(): string {
    return `${this.min}-${this.max}`
  }
}

function isEmptyObject(obj: object): boolean {
  return obj instanceof Object && Object.keys(obj).length === 0
}

function parseU8(buf: Buffer): [number, Buffer] {
  return [buf[0], buf.subarray(1)]
}

function serializeU8(n: number): Buffer {
  const buf = Buffer.alloc(1)
  buf[0] = n
  return buf
}

function parseU16(buf: Buffer): [number, Buffer] {
  return [buf.readUInt16LE(), buf.subarray(2)]
}

function serializeU16(n: number): Buffer {
  const buf = Buffer.alloc(2)
  buf.writeUInt16LE(n)
  return buf
}

function parseU32(buf: Buffer): [number, Buffer] {
  return [buf.readUInt32LE(), buf.subarray(4)]
}

function serializeU32(n: number): Buffer {
  const buf = Buffer.alloc(4)
  buf.writeUInt32LE(n)
  return buf
}

function sizedBufferParseFactory(name: string, offset: number): Function {
  // Caller should bind itself as this.
  function parseSizedBuffer (buf: Buffer): [Buffer, Buffer] {
    const size = this[name] + offset
    return [buf.subarray(0, size), buf.subarray(size)]
  }
  return parseSizedBuffer
}

function serializeBuf(buf: Buffer): Buffer {
  return buf
}

function throwIfNumberNotInRanges(ranges: Range2[]) {
  return (name, value) => {
    const cond = ranges.some(range => rangeContains(range, value))
    if (!cond) {
      throw new Error(
        `Parsed value ${value} for field '${name}' is not within a valid range.
        Valid ranges: ${ranges ?
          ranges.map(range => range.toString()).join(', ') :
          '<no ranges specified>'
        }`)
    }
  }
}

function throwIfBufElementsNotInRanges(ranges: Range2[]) {
  return (name, value: Buffer) => {
    const offendingIndex = value.findIndex(byte => !ranges.some(range => rangeContains(range, byte)))
    if (offendingIndex !== -1) {
      throw new Error(
        `Parsed buffer for field '${name}' has a byte ${value[offendingIndex]}
        at index ${offendingIndex} that is not within a valid range.
        Valid ranges: ${ranges ?
          ranges.map(range => range.toString()).join(', ') :
          '<no ranges specified>'
        }`)
    }
  }
}

export function u8(ranges: Range2[]) {
  return (value, context) => {
    assert(context.kind === 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] = {
      parse: parseU8,
      serialize: serializeU8,
      validate: throwIfNumberNotInRanges(ranges),
    }
  }
}

export function u16(ranges: Range2[]) {
  return (value, context) => {
    assert(context.kind === 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] = {
      parse: parseU16,
      serialize: serializeU16,
      validate: throwIfNumberNotInRanges(ranges),
    }
  }
}

export function u32(ranges: Range2[]) {
  return (value, context) => {
    assert(context.kind === 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] = {
      parse: parseU32,
      serialize: serializeU32,
      validate: throwIfNumberNotInRanges(ranges),
    }
  }
}

export function sizedBuffer(sizeFieldName: string, sizeOffset: number, ranges: Range2[]) {
  return (value, context) => {
    assert(context.kind === 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] = {
      parseFactory: sizedBufferParseFactory(sizeFieldName, sizeOffset),
      serialize: serializeBuf,
      validate: throwIfBufElementsNotInRanges(ranges),
    }
  }
}


export function serial(arg: SerialFormat) {
  return (value, context) => {
    assert(context.kind === 'field')
    // Assumption: at least one range was defined, so field metadata should already exist
    assert(context.metadata.fields, 'Please define at least one range')
    assert(context.metadata.fields[context.name], 'Please define at least one range')
    assert(context.metadata.fields[context.name].ranges, 'Please define at least one range')
    assert(context.metadata.fields[context.name].ranges.length > 0, 'Please define at least one range')
    context.metadata.fields[context.name].serial = arg
  }
}

export function range(min: number, max?: number) {
  if (max === undefined) {
    max = min
  }
  return (value, context) => {
    assert(context.kind === 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] ??= {}
    context.metadata.fields[context.name].ranges ??= []
    context.metadata.fields[context.name].ranges.push(new Range(min, max))
  }
}
