import test from 'node:test'
import assert from 'node:assert'
import {
  HorizontalTab,
  InitPrinter,
  SelectBitImageMode,
  SelectKanjiCharacterFont,
  CancelSetValuesForTopBottomLogoPrinting,
  TransmitSetValuesForTopBottomLogoPrinting,
  parse,
} from '../src/index'

test('ParseError', async (t) => {
  await t.test('unrecognized prefix', t => {
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

type TestCase = {
  class: Function,
  example?: Buffer,
  checks?: object,
}

const testCases: TestCase[] = [
  {
    class: HorizontalTab,
    example: Buffer.from([
      0x09,
    ]),
  },
  {
    class: InitPrinter,
    example: Buffer.from([
      0x1b, 0x40,
    ]),
  },
  {
    class: SelectBitImageMode,
    example: Buffer.from([
      0x1b, 0x2a,
      0x01,
      0x03, 0x00,
      0x05, 0x06, 0x07,
    ]),
    checks: {
      m: 1,
      n: 3,
      d: Buffer.from([0x05, 0x06, 0x07]),
    },
  },
  {
    class: SelectKanjiCharacterFont,
    example: Buffer.from([
      0x1c, 0x28, 0x41,
      0x02, 0x00,
      0x30,
      0x00,
    ]),
    checks: {
      p: 2,
      fn: 0x30,
      m: 0,
    },
  },
  {
    class: CancelSetValuesForTopBottomLogoPrinting,
    example: Buffer.from([
      0x1c, 0x28, 0x45,
      0x06, 0x00,
      0x3c,
      0x02,
      0x30,
      0x43, 0x4c, 0x52,
    ]),
  },
  {
    class: TransmitSetValuesForTopBottomLogoPrinting,
    example: Buffer.from([
      0x1c, 0x28, 0x45,
      0x03, 0x00,
      0x3d,
      0x02,
      0x30,
    ]),
  },
]

for (const testCase of testCases) {
  test(testCase.class.name, t => {
    if (!testCase.example) {
      t.skip()
      return
    }
    const cmds = parse(testCase.example)
    assert.strictEqual(cmds.length, 1)
    const cmd = cmds[0]
    assert(cmd instanceof testCase.class)
    for (const [ key, value ] of Object.entries(testCase.checks ?? {})) {
      assert.deepStrictEqual(cmd[key], value)
    }
  })
}
