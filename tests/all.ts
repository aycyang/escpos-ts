import test from 'node:test'
import assert from 'node:assert'
import {
  BitImageMode,
  UnderlineMode,
  EmphasizedMode,
  CharacterFont,
  WhiteAndBlackReversePrintMode,
  Justification,
  CutMode,
  CutShape,

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
  InitializePrinter,
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
  EnableOrDisableTopOrBottomLogoPrinting,
  SelectCharacterSize,
  SetWhiteAndBlackReversePrintMode,
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
  constructed?: object,
  bytes?: Buffer,
  checks?: object,
}

const testCases: TestCase[] = [
  {
    class: HorizontalTab,
    bytes: Buffer.from([
      0x09,
    ]),
  },
  {
    class: SetCharacterSpacing,
    constructed: new SetCharacterSpacing(16),
    bytes: Buffer.from([
      0x1b, 0x20,
      0x10,
    ]),
    checks: {
      n: 16,
    }
  },
  { class: SelectPrintMode },
  { class: SetAbsolutePrintPosition },
  { class: SelectOrCancelUserDefinedCharacterSet },
  { class: DefineUserDefinedCharacters },
  { class: ControlBeeperTones },
  { class: ModelSpecificBuzzerControl },
  {
    class: SelectBitImageMode,
    constructed: new SelectBitImageMode(
      BitImageMode.EightDotSingleDensity,
      Buffer.from([0x05, 0x06, 0x07])),
    bytes: Buffer.from([
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
    class: SetUnderlineMode,
    constructed: new SetUnderlineMode(UnderlineMode.OneDotThick),
    bytes: Buffer.from([
      0x1b, 0x2d,
      0x01,
    ]),
    checks: {
      n: 1,
    }
  },
  { class: SelectDefaultLineSpacing },
  { class: SetLineSpacing },
  { class: SelectPeripheralDevice },
  { class: CancelUserDefinedCharacters },
  {
    class: InitializePrinter,
    constructed: new InitializePrinter(),
    bytes: Buffer.from([
      0x1b, 0x40,
    ]),
  },
  { class: SetHorizontalTabPositions },
  {
    class: SetEmphasizedMode,
    constructed: new SetEmphasizedMode(EmphasizedMode.On),
    bytes: Buffer.from([
      0x1b, 0x45,
      0x01,
    ]),
    checks: {
      n: 1,
    }
  },
  { class: SetDoubleStrikeMode },
  { class: PrintAndFeedPaper },
  { class: SelectPageMode },
  {
    class: SelectCharacterFont,
    constructed: new SelectCharacterFont(CharacterFont.B),
    bytes: Buffer.from([
      0x1b, 0x4d,
      0x01,
    ]),
    checks: {
      n: 0x01,
    },
  },
  { class: SelectInternationalCharacterSet },
  { class: SelectStandardMode },
  { class: SelectPrintDirectionInPageMode },
  { class: SetRotationMode },
  { class: SetPrintAreaInPageMode },
  { class: SetRelativePrintPosition },
  {
    class: SelectJustification,
    constructed: new SelectJustification(Justification.Center),
    bytes: Buffer.from([
      0x1b, 0x61,
      0x01,
    ]),
    checks: {
      n: 1,
    },
  },
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
    bytes: Buffer.from([
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
    bytes: Buffer.from([
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
    bytes: Buffer.from([
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
    bytes: Buffer.from([
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
  {
    class: SetBottomLogoPrinting,
    bytes: Buffer.from([
      0x1c, 0x28, 0x45,
      0x05, 0x00,
      0x3f,
      0x02,
      0x20,
      0x20,
      0x30,
    ]),
    checks: {
      p: 5,
      fn: 0x3f,
      m: 2,
      kc1: 0x20,
      kc2: 0x20,
      a: 0x30,
    }
  },
  {
    class: MakeExtendedSettingsForTopOrBottomLogoPrinting,
    bytes: Buffer.from([
      0x1c, 0x28, 0x45,
      0x06, 0x00,
      0x40,
      0x02,
      0x30, 0x31,
      0x40, 0x30,
    ]),
    checks: {
      p: 6,
      fn: 0x40,
      m: 2,
      settings: Buffer.from([0x30, 0x31, 0x40, 0x30]),
    }
  },
  {
    class: EnableOrDisableTopOrBottomLogoPrinting,
    bytes: Buffer.from([
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
  {
    class: SelectCharacterSize,
    constructed: new SelectCharacterSize({ width: 2, height: 3 }),
    bytes: Buffer.from([
      0x1d, 0x21,
      0x12,
    ]),
    checks: {
      n: 18,
    },
  },
  {
    class: SetWhiteAndBlackReversePrintMode,
    constructed: new SetWhiteAndBlackReversePrintMode(WhiteAndBlackReversePrintMode.On),
    bytes: Buffer.from([
      0x1d, 0x42,
      0x01,
    ]),
    checks: {
      n: 1,
    },
  },
  {
    class: SelectCutModeAndCutPaper,
    constructed: new SelectCutModeAndCutPaper(CutMode.CutPaper, CutShape.PartialCut),
    bytes: Buffer.from([
      0x1d, 0x56,
      0x01,
    ]),
    checks: {
      m: 1,
    },
  },
]

for (const testCase of testCases) {
  test(testCase.class.name, t => {
    if (!testCase.bytes) {
      t.skip()
      return
    }
    const cmds = parse(testCase.bytes)
    assert.strictEqual(cmds.length, 1)
    const cmd = cmds[0]
    assert(cmd instanceof testCase.class)
    if (testCase.constructed) {
      assert.deepStrictEqual(cmd, testCase.constructed, 'parsed (actual) differs from constructed (expected)')
    }
    for (const [ key, value ] of Object.entries(testCase.checks ?? {})) {
      assert.deepStrictEqual(cmd[key], value, `member ${key} is ${cmd[key]}, but expected ${value}`)
    }
    const buf = cmd.serialize()
    assert.deepStrictEqual(buf, testCase.bytes)
  })
}
