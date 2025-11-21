import { Buffer } from 'buffer'

import '@tsmetadata/polyfill'
import { CmdField, FieldMetadata, ParseFunction } from './fieldDecorators'
import { Ascii, asciiToByte } from './ascii'
import { bufToAbbrevString } from './util'
import { assert } from './assert'

export type CmdClass = {
  desc: string
  new (...args: unknown[]): CmdBase
  from(buf: Buffer): [CmdBase, Buffer]
}

export type CmdClassDecorator = (
  value: CmdClass,
  context: ClassDecoratorContext,
) => void

export class CmdBase {
  static desc: string

  isValid: boolean = false

  toString(): string {
    // If the class definition is still a stub, the prefix won't have been
    // defined yet and there won't be any metadata available.
    const metadata = this.constructor[Symbol.metadata]
    let prefix: string = '[ unknown ]'
    if (metadata && Array.isArray(metadata.prefix)) {
      prefix = `[ ${metadata.prefix.join(' ')} ]`
    }

    const cmdClass = this.constructor as CmdClass
    const fieldsAndValues = []
    for (const [name, value] of Object.entries(this)) {
      if (name === 'isValid') continue
      let valueString: string = (value as number | Buffer).toString()
      if (Buffer.isBuffer(value)) {
        valueString = bufToAbbrevString(value)
      }
      fieldsAndValues.push(`${name}=${valueString}`)
    }
    // TODO explain what each field value means, perhaps with decorators?
    return `${prefix} ${cmdClass.desc} ( ${fieldsAndValues.join(', ')} )`
  }

  validate() {
    const metadata = this.constructor[Symbol.metadata]
    assert(metadata)
    if (!metadata.fields) {
      this.isValid = true
      return
    }
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields)) {
      const value = this[fieldName] as CmdField
      ;(fieldMetadata as FieldMetadata).validate(fieldName, value)
    }
    this.isValid = true
  }

  serialize(): Buffer {
    const metadata = this.constructor[Symbol.metadata]
    assert(metadata)
    const prefix = metadata.prefix as Ascii[]
    const bytes = prefix.map(asciiToByte)
    if (!metadata.fields) return Buffer.from(bytes)
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields)) {
      const fieldValue = this[fieldName] as CmdField
      assert(
        fieldValue !== undefined,
        `${this.constructor.name}.${fieldName} has metadata but is undefined`,
      )
      bytes.push(...(fieldMetadata as FieldMetadata).serialize(fieldValue))
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
  static from(buf: Buffer): [CmdBase, Buffer] {
    const metadata = this[Symbol.metadata]
    assert(metadata)
    // The goal here is to create an object with the subclass's prototype, but
    // without invoking the subclass's constructor. The object's prototype must
    // be that of the subclass so that it can access its reflection metadata in
    // instance methods such as `serialize()`. The constructor must be bypassed
    // because subclasses may define arbitrary constructors which cannot be
    // handled generically. To achieve this goal, `Object.create()` is used
    // here.
    const instance = Object.create(this.prototype) as CmdBase
    if (!metadata.fields) {
      instance.validate()
      return [instance, buf]
    }
    for (const [fieldName, fieldMetadata] of Object.entries(metadata.fields)) {
      let parse = (fieldMetadata as FieldMetadata).parse
      if ((fieldMetadata as FieldMetadata).parseMethod) {
        parse = (fieldMetadata as FieldMetadata).parseMethod.bind(
          instance,
        ) as ParseFunction
      }
      const [value, subarray] = parse(buf)
      instance[fieldName] = value
      buf = subarray
    }
    instance.validate()
    return [instance, buf]
  }
}
