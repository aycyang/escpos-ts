import test from 'node:test'
import assert from 'node:assert'
import {
  parse,
} from '../src/index'

test('InitPrinter', t => {
  const buf = Buffer.from([0x1b, 0x40])
  console.log(parse(buf))
})
