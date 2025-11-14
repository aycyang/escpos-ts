import { register, registerMultiFn, parse } from './parse'
import { serial, range } from './decorators'
export { parse } from './parse'
import { CmdBase } from './cmd'


// --- ENUMS ---


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

const WhiteAndBlackReversePrintModeToNumber: Record<WhiteAndBlackReversePrintMode, number> = {
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

  @serial('u8')
  @range(0, 255)
  n: number

  constructor(n: number) {
    super()
    this.n = n
    this.validate()
  }
}
export class SelectPrintMode extends CmdBase {}
export class SetAbsolutePrintPosition extends CmdBase {}
export class SelectOrCancelUserDefinedCharacterSet extends CmdBase {}
export class DefineUserDefinedCharacters extends CmdBase {}
export class ControlBeeperTones extends CmdBase {}
export class ModelSpecificBuzzerControl extends CmdBase {}

@register(['ESC', '*'])
export class SelectBitImageMode extends CmdBase {
  static override desc: string = 'Select bit-image mode'

  @serial('u8')
  @range(0, 1)
  @range(32, 33)
  m: number

  @serial('u16')
  @range(1, 2047)
  n: number

  @serial({ member: 'n' })
  @range(0, 255)
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

  @serial('u8')
  @range(0, 2)
  @range(48, 50)
  n: number

  constructor(mode: UnderlineMode) {
    super()
    this.n = UnderlineModeToNumber[mode]
    this.validate()
  }
}

export class SelectDefaultLineSpacing extends CmdBase {}
export class SetLineSpacing extends CmdBase {}
export class SelectPeripheralDevice extends CmdBase {}
export class CancelUserDefinedCharacters extends CmdBase {}

@register(['ESC', '@'])
export class InitializePrinter extends CmdBase {
  static override desc: string = 'Initialize printer'
}

export class SetHorizontalTabPositions extends CmdBase {}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ce.html
 */
@register(['ESC', 'E'])
export class SetEmphasizedMode extends CmdBase {
  static override desc: string = 'Turn emphasized mode on/off'

  @serial('u8')
  @range(0, 255)
  n: number

  constructor(mode: EmphasizedMode) {
    super()
    this.n = EmphasizedModeToNumber[mode]
    this.validate()
  }
}

export class SetDoubleStrikeMode extends CmdBase {}
export class PrintAndFeedPaper extends CmdBase {}
export class SelectPageMode extends CmdBase {}

@register(['ESC', 'M'])
export class SelectCharacterFont extends CmdBase {
  static override desc: string = 'Select character font'

  @serial('u8')
  @range(0, 1)
  @range(48, 49)
  @range(97, 98)
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

  @serial('u8')
  @range(0, 2)
  @range(48, 50)
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

  @serial('u8')
  @range(0, 255)
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
  @serial('u16')
  @range(2)
  p: number
  @serial('u8')
  @range(48)
  fn: number
  @serial('u8')
  @range(0, 1)
  @range(48, 49)
  m: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn60.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 60 })
export class CancelSetValuesForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Cancel set values for top/bottom logo printing'

  @serial('u16')
  @range(6)
  p: number

  @serial('u8')
  @range(60)
  fn: number

  @serial('u8')
  @range(2)
  m: number

  @serial('u8')
  @range(48, 49)
  c: number

  @serial('u8')
  @range(67)
  d1: number

  @serial('u8')
  @range(76)
  d2: number

  @serial('u8')
  @range(82)
  d3: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn61.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 61 })
export class TransmitSetValuesForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Transmit set values for top/bottom logo printing'

  @serial('u16')
  @range(3)
  p: number

  @serial('u8')
  @range(61)
  fn: number

  @serial('u8')
  @range(2)
  m: number

  @serial('u8')
  @range(48, 50)
  c: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn62.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 62 })
export class SetTopLogoPrinting extends CmdBase {
  static override desc: string = 'Set top logo printing'

  @serial('u16')
  @range(6)
  p: number

  @serial('u8')
  @range(62)
  fn: number

  @serial('u8')
  @range(2)
  m: number

  @serial('u8')
  @range(32, 126)
  kc1: number

  @serial('u8')
  @range(32, 126)
  kc2: number

  @serial('u8')
  @range(48, 50)
  a: number

  @serial('u8')
  @range(0, 255)
  n: number
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn63.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 63 })
export class SetBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Set bottom logo printing'

  @serial('u16')
  @range(5)
  p: number

  @serial('u8')
  @range(63)
  fn: number

  @serial('u8')
  @range(2)
  m: number

  @serial('u8')
  @range(32, 126)
  kc1: number

  @serial('u8')
  @range(32, 126)
  kc2: number

  @serial('u8')
  @range(48, 50)
  a: number
}

/**
 * NOTE this command has interleaved
 * NOTE this command can vary in size
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn64.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 64 })
export class MakeExtendedSettingsForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Make extended settings for top/bottom logo printing'

  @serial('u16')
  @range(4, 12)
  p: number

  @serial('u8')
  @range(64)
  fn: number

  @serial('u8')
  @range(2)
  m: number

  // TODO this is an oversimplification. should probably be represented as a
  // Map<number, number> (making each option its own separate member would make
  // the population logic too complicated IMO)
  @serial({ member: 'p', offset: -2 })
  @range(48, 67)
  settings: Buffer
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn65.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 65 })
export class EnableOrDisableTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Enable/disable top/bottom logo printing'

  @serial('u16')
  @range(4)
  p: number

  @serial('u8')
  @range(65)
  fn: number

  @serial('u8')
  @range(2)
  m: number

  @serial('u8')
  @range(48, 49)
  a: number

  @serial('u8')
  @range(48, 49)
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
  @serial('u8')
  @range(0, 119)
  n: number

  /**
   * Pass in the desired magnification for character width and height. These
   * should be numbers in the range 1-8. For example, a value of 2 means each
   * character will be twice as wide.
   */
  constructor(config: { width: number, height: number }) {
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

  @serial('u8')
  @range(0, 255)
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

  @serial('u8')
  @range(0, 1)
  @range(48, 49)
  @range(65, 66)
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
