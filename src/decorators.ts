import { kSerialMetadataKey, kRegisterMetadataKey, kRangeMetadataKey } from './symbols'
import assert from 'node:assert'

// TODO eventually, this will be made obsolete by the Decorator Metadata
// feature, which is one stage away from standardization at the time of
// writing: https://github.com/tc39/proposal-decorator-metadata
import 'reflect-metadata'

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

function compose(decorators: Decorator[]): Decorator {
  return (target, propertyKey) => {
    for (const decorator of decorators) {
      decorator(target, propertyKey)
    }
  }
}

function registerMember(target, propertyKey: string) {
  // Assert that there is at least one valid range
  assert(Reflect.hasMetadata(kRangeMetadataKey, target, propertyKey),
    `${target.constructor.name}.${propertyKey}: Please specify one or more valid ranges. Reminder: decorator order matters!`)
  const memberList = Reflect.getMetadata(kRegisterMetadataKey, target) ?? []
  memberList.push(propertyKey)
  Reflect.defineMetadata(kRegisterMetadataKey, memberList, target)
}

export function serial(arg: SerialFormat) {
  return compose([registerMember, Reflect.metadata(kSerialMetadataKey, arg)])
}

export function range(min: number, max?: number) {
  if (max === undefined) {
    max = min
  }
  return (target, propertyKey) => {
    const ranges = Reflect.getMetadata(kRangeMetadataKey, target, propertyKey) ?? []
    ranges.push(new Range(min, max))
    Reflect.defineMetadata(kRangeMetadataKey, ranges, target, propertyKey)
  }
}
