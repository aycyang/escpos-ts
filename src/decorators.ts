import { kSerialMetadataKey, kRegisterMetadataKey, kRangeMetadataKey } from './symbols'
import assert from 'node:assert'

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


export function serial(arg: SerialFormat) {
  return (value, context) => {
    assert.strictEqual(context.kind, 'field')
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
    assert.strictEqual(context.kind, 'field')
    context.metadata.fields ??= {}
    context.metadata.fields[context.name] ??= {}
    context.metadata.fields[context.name].ranges ??= []
    context.metadata.fields[context.name].ranges.push(new Range(min, max))
  }
}
