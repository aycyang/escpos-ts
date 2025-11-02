import test from 'node:test'
import assert from 'node:assert'
import {
  SelectBitImageMode,
  InitPrinter,
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

test('InitPrinter', t => {
  const buf = Buffer.from([0x1b, 0x40])
  const cmds = parse(buf)
  assert.strictEqual(cmds.length, 1)
  assert(cmds[0] instanceof InitPrinter)
})
