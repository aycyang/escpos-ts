import { Buffer } from 'buffer'

import { register, registerMultiFn } from './parse'
import { u8, u16, sizedBuffer, nullTerminatedBuffer } from './fieldDecorators'
import { CmdBase } from './cmd'

export { parse } from './parse'
export type { CmdClass } from './cmd'

// --- ENUMS ---

export enum BuzzerSoundPattern {
  A = 'BuzzerSoundPattern.A',
  B = 'BuzzerSoundPattern.B',
  C = 'BuzzerSoundPattern.C',
  D = 'BuzzerSoundPattern.D',
  E = 'BuzzerSoundPattern.E',
  Error = 'BuzzerSoundPattern.Error',
  PaperEnd = 'BuzzerSoundPattern.PaperEnd',
}

const BuzzerSoundPatternToNumber: Record<BuzzerSoundPattern, number> = {
  [BuzzerSoundPattern.A]: 1,
  [BuzzerSoundPattern.B]: 2,
  [BuzzerSoundPattern.C]: 3,
  [BuzzerSoundPattern.D]: 4,
  [BuzzerSoundPattern.E]: 5,
  [BuzzerSoundPattern.Error]: 6,
  [BuzzerSoundPattern.PaperEnd]: 7,
}

export enum PeripheralDeviceSelection {
  EnablePrinter = 'PeripheralDeviceSelection.EnablePrinter',
  DisablePrinter = 'PeripheralDeviceSelection.DisablePrinter',
}

const PeripheralDeviceSelectionToNumber: Record<
  PeripheralDeviceSelection,
  number
> = {
  [PeripheralDeviceSelection.EnablePrinter]: 1,
  [PeripheralDeviceSelection.DisablePrinter]: 2,
}

export enum UserDefinedCharacterSetSelection {
  Canceled = 'UserDefinedCharacterSetSelection.Canceled',
  Selected = 'UserDefinedCharacterSetSelection.Selected',
}

const UserDefinedCharacterSetSelectionToNumber: Record<
  UserDefinedCharacterSetSelection,
  number
> = {
  [UserDefinedCharacterSetSelection.Canceled]: 0,
  [UserDefinedCharacterSetSelection.Selected]: 1,
}

export enum BitImageMode {
  EightDotSingleDensity = 'BitImageMode.EightDotSingleDensity',
  EightDotDoubleDensity = 'BitImageMode.EightDotDoubleDensity',
  TwentyFourDotSingleDensity = 'BitImageMode.TwentyFourDotSingleDensity',
  TwentyFourDotDoubleDensity = 'BitImageMode.TwentyFourDotDoubleDensity',
}

const BitImageModeToNumber: Record<BitImageMode, number> = {
  [BitImageMode.EightDotDoubleDensity]: 0,
  [BitImageMode.EightDotSingleDensity]: 1,
  [BitImageMode.TwentyFourDotDoubleDensity]: 32,
  [BitImageMode.TwentyFourDotSingleDensity]: 33,
}

export enum UnderlineMode {
  Off = 'UnderlineMode.Off',
  OneDotThick = 'UnderlineMode.OneDotThick',
  TwoDotsThick = 'UnderlineMode.TwoDotsThick',
}

const UnderlineModeToNumber: Record<UnderlineMode, number> = {
  [UnderlineMode.Off]: 0,
  [UnderlineMode.OneDotThick]: 1,
  [UnderlineMode.TwoDotsThick]: 2,
}

export enum SimpleUnderlineMode {
  Off = 'SimpleUnderlineMode.Off',
  On = 'SimpleUnderlineMode.On',
}

const SimpleUnderlineModeToNumber: Record<SimpleUnderlineMode, number> = {
  [SimpleUnderlineMode.Off]: 0,
  [SimpleUnderlineMode.On]: 1,
}

export enum EmphasizedMode {
  Off = 'EmphasizedMode.Off',
  On = 'EmphasizedMode.On',
}

const EmphasizedModeToNumber: Record<EmphasizedMode, number> = {
  [EmphasizedMode.Off]: 0,
  [EmphasizedMode.On]: 1,
}

export enum CharacterFont {
  A = 'CharacterFont.A',
  B = 'CharacterFont.B',
}

const CharacterFontToNumber: Record<CharacterFont, number> = {
  [CharacterFont.A]: 0,
  [CharacterFont.B]: 1,
}

export enum WhiteAndBlackReversePrintMode {
  Off = 'WhiteAndBlackReversePrintMode.Off',
  On = 'WhiteAndBlackReversePrintMode.On',
}

const WhiteAndBlackReversePrintModeToNumber: Record<
  WhiteAndBlackReversePrintMode,
  number
> = {
  [WhiteAndBlackReversePrintMode.Off]: 0,
  [WhiteAndBlackReversePrintMode.On]: 1,
}

export enum Justification {
  Left = 'Justification.Left',
  Center = 'Justification.Center',
  Right = 'Justification.Right',
}

const JustificationToNumber: Record<Justification, number> = {
  [Justification.Left]: 0,
  [Justification.Center]: 1,
  [Justification.Right]: 2,
}

export enum CutMode {
  CutPaper = 'CutMode.CutPaper',
  FeedAndCutPaper = 'CutMode.FeedAndCutPaper',
}

const CutModeToNumber: Record<CutMode, number> = {
  [CutMode.CutPaper]: 0,
  [CutMode.FeedAndCutPaper]: 65,
}

export enum CutShape {
  FullCut = 'CutShape.FullCut',
  PartialCut = 'CutShape.PartialCut',
}

export enum DoubleWidthMode {
  Off = 'DoubleWidthMode.Off',
  On = 'DoubleWidthMode.On',
}

const DoubleWidthModeToNumber: Record<DoubleWidthMode, number> = {
  [DoubleWidthMode.Off]: 0,
  [DoubleWidthMode.On]: 1,
}

export enum DoubleHeightMode {
  Off = 'DoubleHeightMode.Off',
  On = 'DoubleHeightMode.On',
}

const DoubleHeightModeToNumber: Record<DoubleHeightMode, number> = {
  [DoubleHeightMode.Off]: 0,
  [DoubleHeightMode.On]: 1,
}

export enum DoubleStrikeMode {
  Off = 'DoubleStrikeMode.Off',
  On = 'DoubleStrikeMode.On',
}

const DoubleStrikeModeToNumber: Record<DoubleStrikeMode, number> = {
  [DoubleStrikeMode.Off]: 0,
  [DoubleStrikeMode.On]: 1,
}

// --- COMMANDS ---

@register(['HT'])
export class HorizontalTab extends CmdBase {
  static override desc: string = 'Horizontal tab'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_space.html
 */
@register(['ESC', 'SP'])
export class SetCharacterSpacing extends CmdBase {
  static override desc: string = 'Set right-side character spacing'

  @u8([[0, 255]])
  n: number

  constructor(n: number) {
    super()
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_exclamation.html
 */
@register(['ESC', '!'])
export class SelectPrintMode extends CmdBase {
  static override desc: string = 'Select print mode(s)'

  @u8([[0, 255]])
  n: number

  constructor(
    font: CharacterFont,
    em: EmphasizedMode,
    un: SimpleUnderlineMode,
    w2: DoubleWidthMode,
    h2: DoubleHeightMode,
  ) {
    super()
    this.n = 0
    this.n |= CharacterFontToNumber[font] & 1
    this.n |= (EmphasizedModeToNumber[em] & 1) << 3
    this.n |= (DoubleHeightModeToNumber[h2] & 1) << 4
    this.n |= (DoubleWidthModeToNumber[w2] & 1) << 5
    this.n |= (SimpleUnderlineModeToNumber[un] & 1) << 7
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_dollarssign.html
 */
@register(['ESC', '$'])
export class SetAbsolutePrintPosition extends CmdBase {
  static override desc: string = 'Set absolute print position'

  @u16([[0, 65535]])
  n: number

  constructor(n: number) {
    super()
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_percent.html
 */
@register(['ESC', '%'])
export class SelectOrCancelUserDefinedCharacterSet extends CmdBase {
  static override desc: string = 'Select/cancel user-defined character set'

  @u8([[0, 255]])
  n: number

  constructor(sel: UserDefinedCharacterSetSelection) {
    super()
    this.n = UserDefinedCharacterSetSelectionToNumber[sel]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ampersand.html
 * TODO this one's hard
 */
export class DefineUserDefinedCharacters extends CmdBase {}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lparen_ca_fn97.html
 */
@registerMultiFn(['ESC', '(', 'A'], { skip: 2, fn: 97 })
export class ModelSpecificBuzzerControl extends CmdBase {
  static override desc: string = 'Model specific buzzer control (fn=97)'

  @u16([3])
  p: number

  @u8([97])
  fn: number

  @u8([[1, 7]])
  n: number

  @u8([[0, 255]])
  c: number

  constructor(pattern: BuzzerSoundPattern, repeat: number) {
    super()
    this.p = 3
    this.fn = 97
    this.n = BuzzerSoundPatternToNumber[pattern]
    this.c = repeat
    this.validate()
  }
}

@register(['ESC', '*'])
export class SelectBitImageMode extends CmdBase {
  static override desc: string = 'Select bit-image mode'

  @u8([0, 1, 32, 33])
  m: number

  @u16([[1, 2047]])
  n: number

  @sizedBuffer('n', 0, [[0, 255]])
  d: Buffer

  constructor(mode: BitImageMode, d: Buffer) {
    super()
    this.m = BitImageModeToNumber[mode]
    this.n = d.length
    this.d = d
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_minus.html
 */
@register(['ESC', '-'])
export class SetUnderlineMode extends CmdBase {
  static override desc: string = 'Turn underline mode on/off'

  @u8([
    [0, 2],
    [48, 50],
  ])
  n: number

  constructor(mode: UnderlineMode) {
    super()
    this.n = UnderlineModeToNumber[mode]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_2.html
 */
@register(['ESC', '2'])
export class SelectDefaultLineSpacing extends CmdBase {
  static override desc: string = 'Select default line spacing'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_3.html
 */
@register(['ESC', '3'])
export class SetLineSpacing extends CmdBase {
  static override desc: string = 'Set line spacing'

  @u8([[0, 255]])
  n: number

  constructor(n: number) {
    super()
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_equal.html
 */
@register(['ESC', '='])
export class SelectPeripheralDevice extends CmdBase {
  static override desc: string = 'Select peripheral device'

  @u8([[0, 255]])
  n: number

  constructor(sel: PeripheralDeviceSelection) {
    super()
    this.n = PeripheralDeviceSelectionToNumber[sel]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_questionmark.html
 */
@register(['ESC', '?'])
export class CancelUserDefinedCharacters extends CmdBase {
  static override desc: string = 'Cancel user-defined characters'

  @u8([[32, 126]])
  n: number

  constructor(n: number) {
    super()
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_atsign.html
 */
@register(['ESC', '@'])
export class InitializePrinter extends CmdBase {
  static override desc: string = 'Initialize printer'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cd.html
 */
@register(['ESC', 'D'])
export class SetHorizontalTabPositions extends CmdBase {
  static override desc: string = 'Set horizontal tab positions'

  // TODO verify size limit isn't off by one
  @nullTerminatedBuffer([[1, 255]], 32)
  buf: Buffer

  constructor(...args: number[]) {
    super()
    this.buf = Buffer.from([...args, 0])
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ce.html
 */
@register(['ESC', 'E'])
export class SetEmphasizedMode extends CmdBase {
  static override desc: string = 'Turn emphasized mode on/off'

  @u8([[0, 255]])
  n: number

  constructor(mode: EmphasizedMode) {
    super()
    this.n = EmphasizedModeToNumber[mode]
    this.validate()
  }
}

@register(['ESC', 'G'])
export class SetDoubleStrikeMode extends CmdBase {
  static override desc: string = 'Turn double-strike mode on/off'

  @u8([[0, 255]])
  n: number

  constructor(mode: DoubleStrikeMode) {
    super()
    this.n = DoubleStrikeModeToNumber[mode]
    this.validate()
  }
}

export class PrintAndFeedPaper extends CmdBase {}
export class SelectPageMode extends CmdBase {}

@register(['ESC', 'M'])
export class SelectCharacterFont extends CmdBase {
  static override desc: string = 'Select character font'

  @u8([0, 1, 48, 49, 97, 98])
  n: number

  constructor(font: CharacterFont) {
    super()
    this.n = CharacterFontToNumber[font]
    this.validate()
  }
}

export class SelectInternationalCharacterSet extends CmdBase {}
export class SelectStandardMode extends CmdBase {}
export class SelectPrintDirectionInPageMode extends CmdBase {}
export class SetRotationMode extends CmdBase {}
export class SetPrintAreaInPageMode extends CmdBase {}
export class SetRelativePrintPosition extends CmdBase {}

@register(['ESC', 'a'])
export class SelectJustification extends CmdBase {
  static override desc: string = 'Select justification'

  @u8([
    [0, 2],
    [48, 50],
  ])
  n: number

  constructor(justification: Justification) {
    super()
    this.n = JustificationToNumber[justification]
    this.validate()
  }
}

export class SelectPaperSensorsToOutputPaperEndSignals extends CmdBase {}
export class SelectPaperSensorsToStopPrinting extends CmdBase {}
export class EnableOrDisablePanelButtons extends CmdBase {}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ld.html
 */
@register(['ESC', 'd'])
export class PrintAndFeedNLines extends CmdBase {
  static override desc: string = 'Print and feed n lines'

  @u8([[0, 255]])
  n: number

  constructor(n: number) {
    super()
    this.n = n
    this.validate()
  }
}

export class PartialCutOnePointLeftUncut extends CmdBase {}
export class PartialCutThreePointsLeftUncut extends CmdBase {}
export class GeneratePulse extends CmdBase {}
export class SelectCharacterCodeTable extends CmdBase {}
export class TransmitPeripheralDeviceStatus extends CmdBase {}
export class TransmitPaperSensorStatus extends CmdBase {}
export class SetUpsideDownPrintMode extends CmdBase {}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ca_fn48.html
 */
@registerMultiFn(['FS', '(', 'A'], { skip: 2, fn: 48 })
export class SelectKanjiCharacterFont extends CmdBase {
  static override desc: string = 'Select Kanji character style(s)'

  @u16([2])
  p: number

  @u8([48])
  fn: number

  @u8([0, 1, 48, 49])
  m: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn60.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 60 })
export class CancelSetValuesForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string =
    'Cancel set values for top/bottom logo printing'

  @u16([6])
  p: number

  @u8([60])
  fn: number

  @u8([2])
  m: number

  @u8([48, 49])
  c: number

  @u8([67])
  d1: number

  @u8([76])
  d2: number

  @u8([82])
  d3: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn61.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 61 })
export class TransmitSetValuesForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string =
    'Transmit set values for top/bottom logo printing'

  @u16([3])
  p: number

  @u8([61])
  fn: number

  @u8([2])
  m: number

  @u8([[48, 50]])
  c: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn62.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 62 })
export class SetTopLogoPrinting extends CmdBase {
  static override desc: string = 'Set top logo printing'

  @u16([6])
  p: number

  @u8([62])
  fn: number

  @u8([2])
  m: number

  @u8([[32, 126]])
  kc1: number

  @u8([[32, 126]])
  kc2: number

  @u8([[48, 50]])
  a: number

  @u8([[0, 255]])
  n: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn63.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 63 })
export class SetBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Set bottom logo printing'

  @u16([5])
  p: number

  @u8([63])
  fn: number

  @u8([2])
  m: number

  @u8([[32, 126]])
  kc1: number

  @u8([[32, 126]])
  kc2: number

  @u8([[48, 50]])
  a: number
}

/**
 * NOTE this command has interleaved
 * NOTE this command can vary in size
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn64.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 64 })
export class MakeExtendedSettingsForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string =
    'Make extended settings for top/bottom logo printing'

  @u16([[4, 12]])
  p: number

  @u8([64])
  fn: number

  @u8([2])
  m: number

  // TODO this is an oversimplification. should probably be represented as a
  // Map<number, number> (making each option its own separate member would make
  // the population logic too complicated IMO)
  @sizedBuffer('p', -2, [[48, 67]])
  settings: Buffer
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn65.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 65 })
export class EnableOrDisableTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Enable/disable top/bottom logo printing'

  @u16([4])
  p: number

  @u8([65])
  fn: number

  @u8([2])
  m: number

  @u8([[48, 49]])
  a: number

  @u8([[48, 49]])
  n: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_exclamation.html
 */
@register(['GS', '!'])
export class SelectCharacterSize extends CmdBase {
  static override desc: string = 'Select character size'

  // NOTE 0-119 is not exactly accurate. there are ranges within 0-119 which
  // should be considered invalid. this would be easier if we could support a
  // 'u4' type.
  @u8([[0, 119]])
  n: number

  /**
   * Pass in the desired magnification for character width and height. These
   * should be numbers in the range 1-8. For example, a value of 2 means each
   * character will be twice as wide.
   */
  constructor(config: { width: number; height: number }) {
    // TODO should validate these inputs. maybe could get this for free if a 'u4'
    // type were supported
    const upper = (config.width - 1) & 0b0111
    const lower = (config.height - 1) & 0b0111
    const n = (upper << 4) | lower
    super()
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cb.html
 */
@register(['GS', 'B'])
export class SetWhiteAndBlackReversePrintMode extends CmdBase {
  static override desc: string = 'Turn white/black reverse print mode on/off'

  @u8([[0, 255]])
  n: number

  constructor(mode: WhiteAndBlackReversePrintMode) {
    super()
    this.n = WhiteAndBlackReversePrintModeToNumber[mode]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cv.html
 */
@register(['GS', 'V'])
export class SelectCutModeAndCutPaper extends CmdBase {
  static override desc: string = 'Select cut mode and cut paper'

  @u8([0, 1, 48, 49, 65, 66])
  m: number

  // TODO parse n if m is 65 or 66

  constructor(mode: CutMode, shape: CutShape) {
    let m = CutModeToNumber[mode]
    if (shape === CutShape.PartialCut) {
      m++
    }
    super()
    this.m = m
    this.validate()
  }
}
