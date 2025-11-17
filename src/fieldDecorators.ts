import { Buffer } from 'buffer'
import { ParseError } from './parse'
import { assert } from './assert'

type Range = number | [number, number]

function rangeContains(range: Range, value: number) {
  if (Array.isArray(range)) {
    return range[0] <= value && value <= range[1]
  }
  return value === range
}

function throwIfNumberNotInRanges(ranges: Range[]) {
  return (name, value) => {
    const cond = ranges.some((range) => rangeContains(range, value))
    if (!cond) {
      throw new Error(
        `Parsed value ${value} for field '${name}' is not within a valid range.
        Valid ranges: ${
          ranges
            ? ranges.map((range) => range.toString()).join(', ')
            : '<no ranges specified>'
        }`,
      )
    }
  }
}

function throwIfBufElementsNotInRanges(ranges: Range[]) {
  return (name, value: Buffer) => {
    const offendingIndex = value.findIndex(
      (byte) => !ranges.some((range) => rangeContains(range, byte)),
    )
    if (offendingIndex !== -1) {
      throw new Error(
        `Parsed buffer for field '${name}' has a byte ${value[offendingIndex]}
        at index ${offendingIndex} that is not within a valid range.
        Valid ranges: ${
          ranges
            ? ranges.map((range) => range.toString()).join(', ')
            : '<no ranges specified>'
        }`,
      )
    }
  }
}

function throwIfNullTerminatedBufferElementsNotInRanges(ranges: Range[]) {
  return (name, value: Buffer) => {
    const offendingIndex = value
      .subarray(0, -1)
      .findIndex((byte) => !ranges.some((range) => rangeContains(range, byte)))
    if (offendingIndex !== -1) {
      throw new Error(
        `Parsed buffer for field '${name}' has a byte ${value[offendingIndex]}
        at index ${offendingIndex} that is not within a valid range.
        Valid ranges: ${
          ranges
            ? ranges.map((range) => range.toString()).join(', ')
            : '<no ranges specified>'
        }`,
      )
    }
  }
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

type ParseFunction = (Buffer) => [number | Buffer, Buffer]

function sizedBufferParseFactory(name: string, offset: number): ParseFunction {
  // Caller should bind itself as this.
  function parseSizedBuffer(buf: Buffer): [Buffer, Buffer] {
    const size = this[name] + offset
    return [buf.subarray(0, size), buf.subarray(size)]
  }
  return parseSizedBuffer
}

function serializeBuffer(buf: Buffer): Buffer {
  return buf
}

// TODO Instead of throwing a parse error when the size limit is exceeded,
// should just finalize the current command and parse anything beyond the size
// limit normally.
// "A maximum of 32 horizontal tab positions can be set. Data exceeding 32
// horizontal tab positions is processed as normal data."
// source: https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cd.html
// This needs to be tested on a real machine to determine exact behavior.
function nullTerminatedBufferParseFactory(sizeLimit: number): ParseFunction {
  function parseNullTerminatedBuffer(buf: Buffer): [Buffer, Buffer] {
    const i = buf.findIndex((n) => n === 0)
    if (i === -1) {
      throw new ParseError(`null terminator not found`)
    }
    if (i > sizeLimit) {
      throw new ParseError(`null terminator found at index ${i},
        which is beyond the size limit of ${sizeLimit}`)
    }
    return [buf.subarray(0, i + 1), buf.subarray(i + 1)]
  }
  return parseNullTerminatedBuffer
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

export function sizedBuffer(
  sizeFieldName: string,
  sizeOffset: number,
  ranges: Range[],
) {
  return (value, context) => {
    assert(context.kind === 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] = {
      parseFactory: sizedBufferParseFactory(sizeFieldName, sizeOffset),
      serialize: serializeBuffer,
      validate: throwIfBufElementsNotInRanges(ranges),
    }
  }
}

export function nullTerminatedBuffer(ranges: Range[], sizeLimit: number) {
  return (value, context) => {
    assert(context.kind === 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] = {
      parseFactory: nullTerminatedBufferParseFactory(sizeLimit),
      serialize: serializeBuffer,
      validate: throwIfNullTerminatedBufferElementsNotInRanges(ranges),
    }
  }
}
