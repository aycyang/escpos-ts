import test from 'node:test'
import assert from 'node:assert'
import { parse } from '../src/index'

void test('ParseError', async (t) => {
  await t.test('unrecognized prefix', () => {
    assert.throws(
      () => {
        parse(Buffer.from([0x1b, 0x1b]))
      },
      () => true,
    )
  })

  await t.test('incomplete command', () => {
    assert.throws(
      () => {
        parse(Buffer.from([0x1b]))
      },
      () => true,
    )
  })

  await t.test('incomplete command after complete command', () => {
    assert.throws(
      () => {
        parse(Buffer.from([0x1b, 0x40, 0x1b]))
      },
      () => true,
    )
  })
})
