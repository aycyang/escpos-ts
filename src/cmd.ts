import { Buffer } from 'buffer'

import '@tsmetadata/polyfill'
import { asciiToByte } from './ascii'
import { bufToAbbrevString } from './util'
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
    if (!metadata.fields) return
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields)) {
      const value = this[fieldName]
      fieldMetadata.validate(fieldName, value)
    }
  }

  serialize(): Buffer {
    const metadata = this.constructor[Symbol.metadata]
    assert(metadata)
    const prefix = metadata.prefix as any[]
    const bytes = prefix.map(asciiToByte)
    if (!metadata.fields) return Buffer.from(bytes)
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields)) {
      const value = this[fieldName]
      bytes.push(...fieldMetadata.serialize(value))
    }
    return Buffer.from(bytes)
  }

  /**
   * Assumption: the prefix bytes have already been consumed. The passed-in
   * buffer begins just after the prefix bytes. The buffer may contain more
   * bytes than expected, but any fewer would be unexpected.
   *
   * TODO throw parse error if end of buffer is reached prematurely
   */
  static from(buf: Buffer): [any, Buffer] {
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
    if (!metadata.fields) return [instance, buf]
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields)) {
      let parse = fieldMetadata.parse
      if (fieldMetadata.parseFactory) {
        parse = fieldMetadata.parseFactory.bind(instance)
      }
      const [value, subarray] = parse(buf)
      instance[fieldName] = value
      buf = subarray
    }
    instance.validate()
    return [instance, buf]
  }
}

