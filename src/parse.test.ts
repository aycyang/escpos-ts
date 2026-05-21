import test from 'node:test'
import assert from 'node:assert'
import { InvalidCmd, Bytes, Serializable, makeParser } from './parse'
import { InitializePrinter, SetUnderlineMode, UnderlineMode } from './index'
new InitializePrinter() // necessary to prevent dead code elimination
import { ParseError } from './error'

type TestCase = {
  name: string
  bytes: Buffer
  parsed: Serializable[]
  buffered: Buffer
  error?: Error
}

const testCases: TestCase[] = [
  {
    name: 'printable ASCII',
    bytes: Buffer.from([0x40, 0x41, 0x42]),
    parsed: [Bytes.from([0x40, 0x41, 0x42])],
    buffered: Buffer.from([]),
  },
  {
    name: 'unfinished prefix',
    bytes: Buffer.from([0x1b]),
    parsed: [],
    buffered: Buffer.from([0x1b]),
  },
  {
    name: 'unrecognized prefix',
    bytes: Buffer.from([0x1b, 0x1b]),
    parsed: [InvalidCmd.from([0x1b, 0x1b])],
    buffered: Buffer.from([]),
  },
  {
    name: 'invalid command, then printable ASCII',
    bytes: Buffer.from([0x1b, 0x1b, 0x40]),
    parsed: [InvalidCmd.from([0x1b, 0x1b]), Bytes.from([0x40])],
    buffered: Buffer.from([]),
  },
  {
    name: 'command, then printable ASCII',
    bytes: Buffer.from([0x1b, 0x40, 0x40, 0x41, 0x42]),
    parsed: [new InitializePrinter(), Bytes.from([0x40, 0x41, 0x42])],
    buffered: Buffer.from([]),
  },
  {
    name: 'command, then unfinished prefix',
    bytes: Buffer.from([0x1b, 0x40, 0x1b]),
    parsed: [new InitializePrinter()],
    buffered: Buffer.from([0x1b]),
  },
  {
    name: 'SetUnderlineMode: single valid u8 field',
    bytes: Buffer.from([0x1b, 0x2d, 0x00]),
    parsed: [new SetUnderlineMode(UnderlineMode.Off)],
    buffered: Buffer.from([]),
  },
  {
    name: 'SetUnderlineMode: missing a u8 field',
    bytes: Buffer.from([0x1b, 0x2d]),
    parsed: [],
    buffered: Buffer.from([0x1b, 0x2d]),
    error: new ParseError(),
  },
  {
    name: 'SetPrintAreaInPageMode: u16 field ends prematurely',
    bytes: Buffer.from([0x1b, 0x57, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01]),
    parsed: [],
    buffered: Buffer.from([
      0x1b, 0x57, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01,
    ]),
    error: new ParseError(),
  },
  {
    name: 'SetPrintAreaInPageMode: missing a u16 field',
    bytes: Buffer.from([0x1b, 0x57, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]),
    parsed: [],
    buffered: Buffer.from([0x1b, 0x57, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00]),
    error: new ParseError(),
  },
  {
    name: 'SelectBitImageMode: size does not match buffer',
    bytes: Buffer.from([0x1b, 0x2a, 0x01, 0x03, 0x00, 0x05, 0x06]),
    parsed: [],
    buffered: Buffer.from([0x1b, 0x2a, 0x01, 0x03, 0x00, 0x05, 0x06]),
    error: new ParseError(),
  },
]

for (const testCase of testCases) {
  void test(testCase.name, () => {
    const parser = makeParser()
    parser.next()
    const result = parser.next(testCase.bytes)
    assert.deepStrictEqual(result.value.parsed, testCase.parsed)
    assert.deepStrictEqual(result.value.buffered, testCase.buffered)
    if (testCase.error) {
      assert(result.value.error)
      assert.deepStrictEqual(
        result.value.error.constructor,
        testCase.error.constructor,
      )
    }
  })
}
