import test from 'node:test'
import assert from 'node:assert'
import {
  SelectBitImageMode,
  InitPrinter,
  parse,
} from '../src/index'

test('InitPrinter', t => {
  const buf = Buffer.from([0x1b, 0x40])
  const cmds = parse(buf)
  assert.strictEqual(cmds.length, 1)
  assert(cmds[0] instanceof InitPrinter)
})
