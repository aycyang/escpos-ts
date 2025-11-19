import test from 'node:test'
import assert from 'node:assert'
import {
  BuzzerSoundPattern,
  CmdBase,
  PeripheralDeviceSelection,
  UserDefinedCharacterSetSelection,
  BitImageMode,
  UnderlineMode,
  SimpleUnderlineMode,
  EmphasizedMode,
  CharacterFont,
  WhiteAndBlackReversePrintMode,
  Justification,
  CutMode,
  CutShape,
  DoubleWidthMode,
  DoubleHeightMode,
  HorizontalTab,
  SetCharacterSpacing,
  SelectPrintMode,
  SetAbsolutePrintPosition,
  SelectOrCancelUserDefinedCharacterSet,
  DefineUserDefinedCharacters,
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
  DoubleStrikeMode,
} from '../src/index'

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

type TestCase = {
  cmd: CmdBase
  bytes?: Buffer
  checks?: object
}

const testCases: TestCase[] = [
  {
    cmd: new HorizontalTab(),
    bytes: Buffer.from([0x09]),
  },
  {
    cmd: new SetCharacterSpacing(16),
    bytes: Buffer.from([0x1b, 0x20, 0x10]),
    checks: {
      n: 16,
    },
  },
  {
    cmd: new SelectPrintMode(
      CharacterFont.B,
      EmphasizedMode.On,
      SimpleUnderlineMode.On,
      DoubleWidthMode.On,
      DoubleHeightMode.On,
    ),
    bytes: Buffer.from([0x1b, 0x21, 0b10111001]),
    checks: {
      n: 0b10111001,
    },
  },
  {
    cmd: new SetAbsolutePrintPosition(0x0201),
    bytes: Buffer.from([0x1b, 0x24, 0x01, 0x02]),
    checks: {
      n: 0x0201,
    },
  },
  {
    cmd: new SelectOrCancelUserDefinedCharacterSet(
      UserDefinedCharacterSetSelection.Selected,
    ),
    bytes: Buffer.from([0x1b, 0x25, 0x01]),
    checks: {
      n: 1,
    },
  },
  { cmd: new DefineUserDefinedCharacters() },
  {
    cmd: new ModelSpecificBuzzerControl(BuzzerSoundPattern.A, 2),
    bytes: Buffer.from([0x1b, 0x28, 0x41, 0x03, 0x00, 0x61, 0x01, 0x02]),
    checks: {
      p: 3,
      fn: 97,
      n: 1,
      c: 2,
    },
  },
  {
    cmd: new SelectBitImageMode(
      BitImageMode.EightDotSingleDensity,
      Buffer.from([0x05, 0x06, 0x07]),
    ),
    bytes: Buffer.from([0x1b, 0x2a, 0x01, 0x03, 0x00, 0x05, 0x06, 0x07]),
    checks: {
      m: 1,
      n: 3,
      d: Buffer.from([0x05, 0x06, 0x07]),
    },
  },
  {
    cmd: new SetUnderlineMode(UnderlineMode.OneDotThick),
    bytes: Buffer.from([0x1b, 0x2d, 0x01]),
    checks: {
      n: 1,
    },
  },
  {
    cmd: new SelectDefaultLineSpacing(),
    bytes: Buffer.from([0x1b, 0x32]),
  },
  {
    cmd: new SetLineSpacing(1),
    bytes: Buffer.from([0x1b, 0x33, 0x01]),
    checks: {
      n: 1,
    },
  },
  {
    cmd: new SelectPeripheralDevice(PeripheralDeviceSelection.EnablePrinter),
    bytes: Buffer.from([0x1b, 0x3d, 0x01]),
    checks: {
      n: 1,
    },
  },
  {
    cmd: new CancelUserDefinedCharacters(32),
    bytes: Buffer.from([0x1b, 0x3f, 0x20]),
    checks: {
      n: 32,
    },
  },
  {
    cmd: new InitializePrinter(),
    bytes: Buffer.from([0x1b, 0x40]),
  },
  {
    cmd: new SetHorizontalTabPositions(8, 16, 32),
    bytes: Buffer.from([0x1b, 0x44, 8, 16, 32, 0]),
    checks: {
      buf: Buffer.from([8, 16, 32, 0]),
    },
  },
  {
    cmd: new SetEmphasizedMode(EmphasizedMode.On),
    bytes: Buffer.from([0x1b, 0x45, 0x01]),
    checks: {
      n: 1,
    },
  },
  {
    cmd: new SetDoubleStrikeMode(DoubleStrikeMode.On),
    bytes: Buffer.from([0x1b, 0x47, 0x01]),
    checks: {
      n: 0x01,
    },
  },
  { cmd: new PrintAndFeedPaper() },
  { cmd: new SelectPageMode() },
  {
    cmd: new SelectCharacterFont(CharacterFont.B),
    bytes: Buffer.from([0x1b, 0x4d, 0x01]),
    checks: {
      n: 0x01,
    },
  },
  { cmd: new SelectInternationalCharacterSet() },
  {
    cmd: new SelectStandardMode(),
    bytes: Buffer.from([0x1b, 0x53]),
  },
  { cmd: new SelectPrintDirectionInPageMode() },
  { cmd: new SetRotationMode() },
  { cmd: new SetPrintAreaInPageMode() },
  { cmd: new SetRelativePrintPosition() },
  {
    cmd: new SelectJustification(Justification.Center),
    bytes: Buffer.from([0x1b, 0x61, 0x01]),
    checks: {
      n: 1,
    },
  },
  { cmd: new SelectPaperSensorsToOutputPaperEndSignals() },
  { cmd: new SelectPaperSensorsToStopPrinting() },
  { cmd: new EnableOrDisablePanelButtons() },
  {
    cmd: new PrintAndFeedNLines(1),
    bytes: Buffer.from([0x1b, 0x64, 0x01]),
    checks: {
      n: 1,
    },
  },
  { cmd: new PartialCutOnePointLeftUncut() },
  { cmd: new PartialCutThreePointsLeftUncut() },
  { cmd: new GeneratePulse() },
  { cmd: new SelectCharacterCodeTable() },
  { cmd: new TransmitPeripheralDeviceStatus() },
  { cmd: new TransmitPaperSensorStatus() },
  { cmd: new SetUpsideDownPrintMode() },
  {
    cmd: new SelectKanjiCharacterFont(0),
    bytes: Buffer.from([0x1c, 0x28, 0x41, 0x02, 0x00, 0x30, 0x00]),
    checks: {
      p: 2,
      fn: 0x30,
      m: 0,
    },
  },
  {
    cmd: new CancelSetValuesForTopOrBottomLogoPrinting(0x30),
    bytes: Buffer.from([
      0x1c, 0x28, 0x45, 0x06, 0x00, 0x3c, 0x02, 0x30, 0x43, 0x4c, 0x52,
    ]),
    checks: {
      p: 6,
      fn: 0x3c,
      m: 2,
      c: 0x30,
      d1: 0x43,
      d2: 0x4c,
      d3: 0x52,
    },
  },
  {
    cmd: new TransmitSetValuesForTopOrBottomLogoPrinting(0x30),
    bytes: Buffer.from([0x1c, 0x28, 0x45, 0x03, 0x00, 0x3d, 0x02, 0x30]),
    checks: {
      p: 3,
      fn: 0x3d,
      m: 2,
      c: 0x30,
    },
  },
  {
    cmd: new SetTopLogoPrinting(0x20, 0x20, 0x30, 0x00),
    bytes: Buffer.from([
      0x1c, 0x28, 0x45, 0x06, 0x00, 0x3e, 0x02, 0x20, 0x20, 0x30, 0x00,
    ]),
    checks: {
      p: 6,
      fn: 0x3e,
      m: 2,
      kc1: 0x20,
      kc2: 0x20,
      a: 0x30,
      n: 0x00,
    },
  },
  {
    cmd: new SetBottomLogoPrinting(0x20, 0x20, 0x30),
    bytes: Buffer.from([
      0x1c, 0x28, 0x45, 0x05, 0x00, 0x3f, 0x02, 0x20, 0x20, 0x30,
    ]),
    checks: {
      p: 5,
      fn: 0x3f,
      m: 2,
      kc1: 0x20,
      kc2: 0x20,
      a: 0x30,
    },
  },
  {
    cmd: new MakeExtendedSettingsForTopOrBottomLogoPrinting(
      6,
      Buffer.from([0x30, 0x31, 0x40, 0x30]),
    ),
    bytes: Buffer.from([
      0x1c, 0x28, 0x45, 0x06, 0x00, 0x40, 0x02, 0x30, 0x31, 0x40, 0x30,
    ]),
    checks: {
      p: 6,
      fn: 0x40,
      m: 2,
      settings: Buffer.from([0x30, 0x31, 0x40, 0x30]),
    },
  },
  {
    cmd: new EnableOrDisableTopOrBottomLogoPrinting(0x30, 0x30),
    bytes: Buffer.from([0x1c, 0x28, 0x45, 0x04, 0x00, 0x41, 0x02, 0x30, 0x30]),
    checks: {
      p: 4,
      fn: 0x41,
      m: 2,
      a: 0x30,
      n: 0x30,
    },
  },
  {
    cmd: new SelectCharacterSize({ width: 2, height: 3 }),
    bytes: Buffer.from([0x1d, 0x21, 0x12]),
    checks: {
      n: 18,
    },
  },
  {
    cmd: new SetWhiteAndBlackReversePrintMode(WhiteAndBlackReversePrintMode.On),
    bytes: Buffer.from([0x1d, 0x42, 0x01]),
    checks: {
      n: 1,
    },
  },
  {
    cmd: new SelectCutModeAndCutPaper(CutMode.CutPaper, CutShape.PartialCut),
    bytes: Buffer.from([0x1d, 0x56, 0x01]),
    checks: {
      m: 1,
    },
  },
]

for (const testCase of testCases) {
  void test(testCase.cmd.toString(), (t) => {
    if (!testCase.bytes) {
      t.skip()
      return
    }

    const cmds = parse(testCase.bytes)
    assert.strictEqual(cmds.length, 1)
    const parsedCmd = cmds[0]
    assert(parsedCmd.isValid)

    assert(
      testCase.cmd.isValid,
      'this.validate() must be called at the end of the subclass constructor',
    )
    assert.deepStrictEqual(
      parsedCmd,
      testCase.cmd,
      'parsed (actual) differs from cmd (expected)',
    )

    for (const [key, value] of Object.entries(testCase.checks ?? {})) {
      assert.deepStrictEqual(
        parsedCmd[key],
        value,
        `member ${key} is ${parsedCmd[key]}, but expected ${value}`,
      )
    }

    const buf = parsedCmd.serialize()
    assert.deepStrictEqual(buf, testCase.bytes)
  })
}
