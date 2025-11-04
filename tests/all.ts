import test from 'node:test'
import assert from 'node:assert'
import {
  HorizontalTab,
  SetCharacterSpacing,
  SelectPrintMode,
  SetAbsolutePrintPosition,
  SelectOrCancelUserDefinedCharacterSet,
  DefineUserDefinedCharacters,
  ControlBeeperTones,
  ModelSpecificBuzzerControl,
  SelectBitImageMode,
  SetUnderlineMode,
  SelectDefaultLineSpacing,
  SetLineSpacing,
  SelectPeripheralDevice,
  CancelUserDefinedCharacters,
  InitPrinter,
  SetHorizontalTabPositions,
  SetEmphasizedMode,
  SetDoubleStrikeMode,
  PrintAndFeedPaper,
  SelectPageMode,
  SelectCharacterFont,
  SelectInternationalCharacterSet,
  SelectStandardMode,
  SelectPrintDirectionInPageMode,
  SetRotationMode,
  SetPrintAreaInPageMode,
  SetRelativePrintPosition,
  SelectJustification,
  SelectPaperSensorsToOutputPaperEndSignals,
  SelectPaperSensorsToStopPrinting,
  EnableOrDisablePanelButtons,
  PrintAndFeedNLines,
  PartialCutOnePointLeftUncut,
  PartialCutThreePointsLeftUncut,
  GeneratePulse,
  SelectCharacterCodeTable,
  TransmitPeripheralDeviceStatus,
  TransmitPaperSensorStatus,
  SetUpsideDownPrintMode,
  SelectKanjiCharacterFont,
  CancelSetValuesForTopOrBottomLogoPrinting,
  TransmitSetValuesForTopOrBottomLogoPrinting,
  SetTopLogoPrinting,
  SetBottomLogoPrinting,
  MakeExtendedSettingsForTopOrBottomLogoPrinting,
  EnableDisableTopOrBottomLogoPrinting,
  SelectCharacterSize,
  SetInvertColorMode,
  SelectCutModeAndCutPaper,
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
  { class: SetCharacterSpacing },
  { class: SelectPrintMode },
  { class: SetAbsolutePrintPosition },
  { class: SelectOrCancelUserDefinedCharacterSet },
  { class: DefineUserDefinedCharacters },
  { class: ControlBeeperTones },
  { class: ModelSpecificBuzzerControl },
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
  { class: SetUnderlineMode },
  { class: SelectDefaultLineSpacing },
  { class: SetLineSpacing },
  { class: SelectPeripheralDevice },
  { class: CancelUserDefinedCharacters },
  {
    class: InitPrinter,
    example: Buffer.from([
      0x1b, 0x40,
    ]),
  },
  { class: SetHorizontalTabPositions },
  { class: SetEmphasizedMode },
  { class: SetDoubleStrikeMode },
  { class: PrintAndFeedPaper },
  { class: SelectPageMode },
  { class: SelectCharacterFont },
  { class: SelectInternationalCharacterSet },
  { class: SelectStandardMode },
  { class: SelectPrintDirectionInPageMode },
  { class: SetRotationMode },
  { class: SetPrintAreaInPageMode },
  { class: SetRelativePrintPosition },
  { class: SelectJustification },
  { class: SelectPaperSensorsToOutputPaperEndSignals },
  { class: SelectPaperSensorsToStopPrinting },
  { class: EnableOrDisablePanelButtons },
  { class: PrintAndFeedNLines },
  { class: PartialCutOnePointLeftUncut },
  { class: PartialCutThreePointsLeftUncut },
  { class: GeneratePulse },
  { class: SelectCharacterCodeTable },
  { class: TransmitPeripheralDeviceStatus },
  { class: TransmitPaperSensorStatus },
  { class: SetUpsideDownPrintMode },
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
    class: CancelSetValuesForTopOrBottomLogoPrinting,
    example: Buffer.from([
      0x1c, 0x28, 0x45,
      0x06, 0x00,
      0x3c,
      0x02,
      0x30,
      0x43, 0x4c, 0x52,
    ]),
    checks: {
      p: 6,
      fn: 0x3c,
      m: 2,
      c: 0x30,
      d1: 0x43,
      d2: 0x4c,
      d3: 0x52,
    }
  },
  {
    class: TransmitSetValuesForTopOrBottomLogoPrinting,
    example: Buffer.from([
      0x1c, 0x28, 0x45,
      0x03, 0x00,
      0x3d,
      0x02,
      0x30,
    ]),
    checks: {
      p: 3,
      fn: 0x3d,
      m: 2,
      c: 0x30,
    }
  },
  {
    class: SetTopLogoPrinting,
    example: Buffer.from([
      0x1c, 0x28, 0x45,
      0x06, 0x00,
      0x3e,
      0x02,
      0x20,
      0x20,
      0x30,
      0x00,
    ]),
    checks: {
      p: 6,
      fn: 0x3e,
      m: 2,
      kc1: 0x20,
      kc2: 0x20,
      a: 0x30,
      n: 0x00,
    }
  },
  { class: SetBottomLogoPrinting },
  { class: MakeExtendedSettingsForTopOrBottomLogoPrinting },
  {
    class: EnableDisableTopOrBottomLogoPrinting,
    example: Buffer.from([
      0x1c, 0x28, 0x45,
      0x04, 0x00,
      0x41,
      0x02,
      0x30,
      0x30,
    ]),
    checks: {
      p: 4,
      fn: 0x41,
      m: 2,
      a: 0x30,
      n: 0x30,
    }
  },
  { class: SelectCharacterSize },
  { class: SetInvertColorMode },
  { class: SelectCutModeAndCutPaper },
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
      assert.deepStrictEqual(cmd[key], value, `member ${key} is ${cmd[key]}, but expected ${value}`)
    }
    const buf = cmd.serialize()
    assert.deepStrictEqual(buf, testCase.example)
  })
}
