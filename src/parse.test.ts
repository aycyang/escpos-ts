import test from 'node:test'
import assert from 'node:assert'
import { Bytes, Serializable, parse } from './parse'
import { InitializePrinter, SetUnderlineMode, UnderlineMode } from './index'
import { ParseError, ValidationError } from './error'

type TestCase = {
  name: string
  bytes: Buffer
  result: Serializable[] | Error
}

const testCases: TestCase[] = [
  {
    name: 'printable ASCII',
    bytes: Buffer.from([0x40, 0x41, 0x42]),
    result: [Bytes.from([0x40, 0x41, 0x42])],
  },
  {
    name: 'unfinished prefix',
    bytes: Buffer.from([0x1b]),
    result: [Bytes.from([0x1b])],
  },
  {
    name: 'unrecognized prefix',
    bytes: Buffer.from([0x1b, 0x1b]),
    result: [Bytes.from([0x1b, 0x1b])],
  },
  {
    name: 'unfinished prefix, then a command',
    bytes: Buffer.from([0x1b, 0x1b, 0x40]),
    result: [Bytes.from([0x1b]), new InitializePrinter()],
  },
  {
    name: 'command, then printable ASCII',
    bytes: Buffer.from([0x1b, 0x40, 0x40, 0x41, 0x42]),
    result: [new InitializePrinter(), Bytes.from([0x40, 0x41, 0x42])],
  },
  {
    name: 'command, then unfinished prefix',
    bytes: Buffer.from([0x1b, 0x40, 0x1b]),
    result: [new InitializePrinter(), Bytes.from([0x1b])],
  },
  {
    name: 'SetUnderlineMode: single valid u8 field',
    bytes: Buffer.from([0x1b, 0x2d, 0x00]),
    result: [new SetUnderlineMode(UnderlineMode.Off)],
  },
  {
    name: 'SetUnderlineMode: missing a u8 field',
    bytes: Buffer.from([0x1b, 0x2d]),
    result: new ParseError(),
  },
  {
    name: 'SetUnderlineMode: u8 field not in valid range',
    bytes: Buffer.from([0x1b, 0x2d, 0x03]),
    result: new ValidationError(),
  },
  {
    name: 'SetPrintAreaInPageMode: u16 field ends prematurely',
    bytes: Buffer.from([0x1b, 0x57, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01]),
    result: new ParseError(),
  },
  {
    name: 'SetPrintAreaInPageMode: missing a u16 field',
    bytes: Buffer.from([0x1b, 0x57, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]),
    result: new ParseError(),
  },
  {
    name: 'SetPrintAreaInPageMode: u16 field not in valid range',
    bytes: Buffer.from([
      0x1b, 0x57, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]),
    result: new ValidationError(),
  },
]

for (const testCase of testCases) {
  void test(testCase.name, () => {
    if (testCase.result instanceof Error) {
      try {
        void parse(testCase.bytes)
        assert(false, `should have thrown ${testCase.result.constructor.name}`)
      } catch (error) {
        const e: Error = error as Error
        assert.deepStrictEqual(
          e.constructor,
          testCase.result.constructor,
          `wrong error type: ${e.constructor.name}: ${e.message}`,
        )
      }
    } else {
      assert.deepStrictEqual(parse(testCase.bytes), testCase.result)
    }
  })
}
