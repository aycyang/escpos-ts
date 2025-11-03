import test from 'node:test'
import assert from 'node:assert'
import {
  HorizontalTab,
  InitPrinter,
  SelectBitImageMode,
  parse,
} from '../src/index'

test('ParseError', async (t) => {
  await t.test('unrecognized prelude', t => {
    assert.throws(() => {
      parse(Buffer.from([0x1b, 0x1b]))
    }, error => {
      return true
    })
  })

  await t.test('incomplete command', t => {
    assert.throws(() => {
      parse(Buffer.from([0x1b]))
    }, error => {
      return true
    })
  })

  await t.test('incomplete command after complete command', t => {
    assert.throws(() => {
      parse(Buffer.from([0x1b, 0x40, 0x1b]))
    }, error => {
      return true
    })
  })

})

test('HorizontalTab', t => {
  const buf = Buffer.from([0x09])
  const cmds = parse(buf)
  assert.strictEqual(cmds.length, 1)
  assert(cmds[0] instanceof HorizontalTab)
})

test('InitPrinter', t => {
  const buf = Buffer.from([0x1b, 0x40])
  const cmds = parse(buf)
  assert.strictEqual(cmds.length, 1)
  assert(cmds[0] instanceof InitPrinter)
})

test('SelectBitImageMode', t => {
  const buf = Buffer.from([
    0x1b, 0x2a,
    0x01,
    0x03, 0x00,
    0x05, 0x06, 0x07,
  ])
  const cmds = parse(buf)
  assert.strictEqual(cmds.length, 1)
  const cmd = cmds[0]
  assert(cmd instanceof SelectBitImageMode)
  assert.strictEqual(cmd.m, 1)
  assert.strictEqual(cmd.n, 3)
  assert.deepStrictEqual(cmd.d, Buffer.from([5,6,7]))
})
