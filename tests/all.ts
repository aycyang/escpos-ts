import test from 'node:test'
import assert from 'node:assert'
import {
  parse,
  InitPrinter,
  SetEmphasizedMode,
  EmphasizedMode,
}from '../src/index'

test('InitPrinter', t => {
  const buf = Buffer.from([0x1b, 0x40])

  // serialize
  assert.deepStrictEqual((new InitPrinter()).serialize(), buf)

  // parse
  assert.deepStrictEqual(parse(buf), [new InitPrinter()])
})

test('SetEmphasizedMode', t => {
  assert.deepStrictEqual(
    (new SetEmphasizedMode(EmphasizedMode.Off)).serialize(),
    Buffer.from([0x1b, 0x45, 0x00]))
  assert.deepStrictEqual(
    (new SetEmphasizedMode(EmphasizedMode.On)).serialize(),
    Buffer.from([0x1b, 0x45, 0x01]))
})
