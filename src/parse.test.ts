import test from 'node:test'
import assert from 'node:assert'
import { Bytes, Serializable, parse } from './parse'
import { InitializePrinter } from './index'

type TestCase = {
  name: string
  bytes: Buffer
  parsed: Serializable[]
}

const testCases: TestCase[] = [
  {
    name: 'printable ASCII',
    bytes: Buffer.from([0x40, 0x41, 0x42]),
    parsed: [Bytes.from([0x40, 0x41, 0x42])],
  },
  {
    name: 'unfinished prefix',
    bytes: Buffer.from([0x1b]),
    parsed: [Bytes.from([0x1b])],
  },
  {
    name: 'unrecognized prefix',
    bytes: Buffer.from([0x1b, 0x1b]),
    parsed: [Bytes.from([0x1b, 0x1b])],
  },
  {
    name: 'unfinished prefix, then a command',
    bytes: Buffer.from([0x1b, 0x1b, 0x40]),
    parsed: [Bytes.from([0x1b]), new InitializePrinter()],
  },
  {
    name: 'command, then printable ASCII',
    bytes: Buffer.from([0x1b, 0x40, 0x40, 0x41, 0x42]),
    parsed: [new InitializePrinter(), Bytes.from([0x40, 0x41, 0x42])],
  },
  {
    name: 'command, then unfinished prefix',
    bytes: Buffer.from([0x1b, 0x40, 0x1b]),
    parsed: [new InitializePrinter(), Bytes.from([0x1b])],
  },
]

for (const testCase of testCases) {
  void test(testCase.name, () => {
    assert.deepStrictEqual(parse(testCase.bytes), testCase.parsed)
  })
}
