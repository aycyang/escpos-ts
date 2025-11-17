import { Buffer } from 'buffer'
import { assert } from './assert'

type Range = number | [ number, number ]

function rangeContains(range: Range, value: number) {
  if (Array.isArray(range)) {
    return range[0] <= value && value <= range[1]
  }
  return value === range
}

function throwIfNumberNotInRanges(ranges: Range[]) {
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

function throwIfBufElementsNotInRanges(ranges: Range[]) {
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

export function u8(ranges: Range[]) {
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

export function u16(ranges: Range[]) {
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

export function u32(ranges: Range[]) {
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

export function sizedBuffer(sizeFieldName: string, sizeOffset: number, ranges: Range[]) {
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
