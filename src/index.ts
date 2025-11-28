import { Buffer } from 'buffer'

import { register, registerMultiFn } from './parse'
import {
  throwIfBufElementsNotInRanges,
  rangeContains,
  custom,
  u8,
  u16,
  sizedBuffer,
  nullTerminatedBuffer,
} from './fieldDecorators'
import { CmdBase } from './cmd'
import { ParseError, ValidationError } from './error'

export { parse } from './parse'
export type { CmdBase, CmdClass } from './cmd'

// --- ENUMS ---

export enum InternationalCharacterSet {
  USA = 'InternationalCharacterSet.USA',
  France = 'InternationalCharacterSet.France',
  Germany = 'InternationalCharacterSet.Germany',
  UK = 'InternationalCharacterSet.UK',
  Denmark1 = 'InternationalCharacterSet.Denmark1',
  Sweden = 'InternationalCharacterSet.Sweden',
  Italy = 'InternationalCharacterSet.Italy',
  Spain1 = 'InternationalCharacterSet.Spain1',
  Japan = 'InternationalCharacterSet.Japan',
  Norway = 'InternationalCharacterSet.Norway',
  Denmark2 = 'InternationalCharacterSet.Denmark2',
  Spain2 = 'InternationalCharacterSet.Spain2',
  LatinAmerica = 'InternationalCharacterSet.LatinAmerica',
  Korea = 'InternationalCharacterSet.Korea',
  SloveniaCroatia = 'InternationalCharacterSet.SloveniaCroatia',
  China = 'InternationalCharacterSet.China',
  Vietnam = 'InternationalCharacterSet.Vietnam',
  Arabia = 'InternationalCharacterSet.Arabia',
  IndiaDevanagari = 'InternationalCharacterSet.IndiaDevanagari',
  IndiaBengali = 'InternationalCharacterSet.IndiaBengali',
  IndiaTamil = 'InternationalCharacterSet.IndiaTamil',
  IndiaTelugu = 'InternationalCharacterSet.IndiaTelugu',
  IndiaAssamese = 'InternationalCharacterSet.IndiaAssamese',
  IndiaOriya = 'InternationalCharacterSet.IndiaOriya',
  IndiaKannada = 'InternationalCharacterSet.IndiaKannada',
  IndiaMalayalam = 'InternationalCharacterSet.IndiaMalayalam',
  IndiaGujarati = 'InternationalCharacterSet.IndiaGujarati',
  IndiaPunjabi = 'InternationalCharacterSet.IndiaPunjabi',
  IndiaMarathi = 'InternationalCharacterSet.IndiaMarathi',
}

const InternationalCharacterSetToNumber: Record<
  InternationalCharacterSet,
  number
> = {
  [InternationalCharacterSet.USA]: 0,
  [InternationalCharacterSet.France]: 1,
  [InternationalCharacterSet.Germany]: 2,
  [InternationalCharacterSet.UK]: 3,
  [InternationalCharacterSet.Denmark1]: 4,
  [InternationalCharacterSet.Sweden]: 5,
  [InternationalCharacterSet.Italy]: 6,
  [InternationalCharacterSet.Spain1]: 7,
  [InternationalCharacterSet.Japan]: 8,
  [InternationalCharacterSet.Norway]: 9,
  [InternationalCharacterSet.Denmark2]: 10,
  [InternationalCharacterSet.Spain2]: 11,
  [InternationalCharacterSet.LatinAmerica]: 12,
  [InternationalCharacterSet.Korea]: 13,
  [InternationalCharacterSet.SloveniaCroatia]: 14,
  [InternationalCharacterSet.China]: 15,
  [InternationalCharacterSet.Vietnam]: 16,
  [InternationalCharacterSet.Arabia]: 17,
  [InternationalCharacterSet.IndiaDevanagari]: 66,
  [InternationalCharacterSet.IndiaBengali]: 67,
  [InternationalCharacterSet.IndiaTamil]: 68,
  [InternationalCharacterSet.IndiaTelugu]: 69,
  [InternationalCharacterSet.IndiaAssamese]: 70,
  [InternationalCharacterSet.IndiaOriya]: 71,
  [InternationalCharacterSet.IndiaKannada]: 72,
  [InternationalCharacterSet.IndiaMalayalam]: 73,
  [InternationalCharacterSet.IndiaGujarati]: 74,
  [InternationalCharacterSet.IndiaPunjabi]: 75,
  [InternationalCharacterSet.IndiaMarathi]: 82,
}

export enum PaperSensor {
  Off = 'PaperSensor.Off',
  NearEnd = 'PaperSensor.NearEnd',
  End = 'PaperSensor.End',
}

const PaperSensorToNumber: Record<PaperSensor, number> = {
  [PaperSensor.Off]: 0,
  [PaperSensor.NearEnd]: 0b0001,
  [PaperSensor.End]: 0b0100,
}

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

export enum CutShape {
  FullCut = 'CutShape.FullCut',
  PartialCut = 'CutShape.PartialCut',
}

const CutShapeToNumber: Record<CutShape, number> = {
  [CutShape.FullCut]: 0,
  [CutShape.PartialCut]: 1,
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

export enum PrintDirection {
  LeftToRight = 'PrintDirection.LeftToRight',
  BottomToTop = 'PrintDirection.BottomToTop',
  RightToLeft = 'PrintDirection.RightToLeft',
  TopToBottom = 'PrintDirection.TopToBottom',
}

const PrintDirectionToNumber: Record<PrintDirection, number> = {
  [PrintDirection.LeftToRight]: 0,
  [PrintDirection.BottomToTop]: 1,
  [PrintDirection.RightToLeft]: 2,
  [PrintDirection.TopToBottom]: 3,
}

export enum ClockwiseRotationMode {
  Off = 'ClockwiseRotationMode.Off',
  OneDotSpacing = 'ClockwiseRotationMode.OneDotSpacing',
  OneAndHalfDotSpacing = 'ClockwiseRotationMode.OneAndHalfDotSpacing',
}

const ClockwiseRotationModeToNumber: Record<ClockwiseRotationMode, number> = {
  [ClockwiseRotationMode.Off]: 0,
  [ClockwiseRotationMode.OneDotSpacing]: 1,
  [ClockwiseRotationMode.OneAndHalfDotSpacing]: 2,
}

export enum UpsideDownPrintMode {
  Off = 'UpsideDownPrintMode.Off',
  On = 'UpsideDownPrintMode.On',
}

const UpsideDownPrintModeToNumber: Record<UpsideDownPrintMode, number> = {
  [UpsideDownPrintMode.Off]: 0,
  [UpsideDownPrintMode.On]: 1,
}
// --- COMMANDS ---

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/ht.html
 */
@register(['HT'])
export class HorizontalTab extends CmdBase {
  static override desc: string = 'Horizontal tab'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/lf.html
 */
@register(['LF'])
export class PrintAndLineFeed extends CmdBase {
  static desc: string = 'Print and line feed'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/ff_in_page.html
 */
@register(['FF'])
export class PrintAndReturnToStandardMode extends CmdBase {
  static desc: string = 'Print and return to Standard mode (in Page mode)'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/cr.html
 */
@register(['CR'])
export class PrintAndCarriageReturn extends CmdBase {
  static desc: string = 'Print and carriage return'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_eot.html
 */
export class dle_eot extends CmdBase {
  static desc: string = 'Transmit real-time status'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_enq.html
 */
export class dle_enq extends CmdBase {
  static desc: string = 'Send real-time request to printer'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_dc4_fn1.html
 */
export class dle_dc4_fn1 extends CmdBase {
  static desc: string = 'Generate pulse in real-time'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_dc4_fn2.html
 */
export class dle_dc4_fn2 extends CmdBase {
  static desc: string = 'Execute power-off sequence'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_dc4_fn3.html
 */
export class dle_dc4_fn3 extends CmdBase {
  static desc: string = 'Sound buzzer in real-time'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/dle_dc4_fn8.html
 */
export class dle_dc4_fn8 extends CmdBase {
  static desc: string = 'Clear buffer(s)'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/can.html
 */
export class can extends CmdBase {
  static desc: string = 'Cancel print data in Page mode'
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
 */
@register(['ESC', '&'])
export class DefineUserDefinedCharacters extends CmdBase {
  static override desc: string = 'Define user-defined characters'

  @u8([3])
  y: number

  @u8([[32, 126]])
  c1: number

  @u8([[32, 126]])
  c2: number

  @custom({
    parse(this: DefineUserDefinedCharacters, buf: Buffer) {
      if (this.c2 < this.c1) {
        throw new ParseError(
          `c1 should be less than or equal to c2, but c1=${this.c1} and c2=${this.c2}.`,
        )
      }
      const numBufs = this.c2 - this.c1 + 1
      const bufs = []
      for (let i = 0; i < numBufs; i++) {
        const x = buf[0]
        const size = 1 + this.y * x
        bufs.push(buf.subarray(0, size))
        buf = buf.subarray(size)
      }
      return [bufs, buf]
    },
    serialize(value: Buffer[]) {
      return Buffer.concat(value)
    },
    validate(name: string, value: Buffer[]) {
      // NOTE The validity of x depends on which font is selected (for Font A,
      // it's 0-12; for Font B, it's 0-9). This parser is unaware of printer
      // state, so it uses the more permissive range in all cases, even though
      // this is technically inaccurate.
      for (const buf of value) {
        const x = buf[0]
        if (!rangeContains([0, 12], x)) {
          throw new ValidationError(
            `in ${name}, found x=${x}, but should be in range 0-12.`,
          )
        }
        throwIfBufElementsNotInRanges([[0, 255]])(name, buf)
      }
    },
  })
  bufs: Buffer[]

  constructor(c1: number, bufs: Buffer[]) {
    super()
    this.y = 3
    this.c1 = c1
    this.c2 = c1 + bufs.length - 1
    this.bufs = bufs.map((buf) => {
      const paddedX = Math.floor((buf.length + this.y - 1) / this.y)
      const paddedLength = paddedX * this.y
      const padded = [paddedX, ...buf]
      while (padded.length < paddedLength + 1) {
        padded.push(0)
      }
      return Buffer.from(padded)
    })
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lparen_ca_fn97.html
 */
@registerMultiFn(['ESC', '(', 'A'], { skip: 2, fns: [97] })
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

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_asterisk.html
 */
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

  constructor() {
    super()
    this.validate()
  }
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

  constructor() {
    super()
    this.validate()
  }
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

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cg.html
 */
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

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cj.html
 */
@register(['ESC', 'J'])
export class PrintAndFeedPaper extends CmdBase {
  static desc: string = 'Print and feed paper'

  @u8([[0, 255]])
  n: number

  constructor(n: number) {
    super()
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cl.html
 */
@register(['ESC', 'L'])
export class SelectPageMode extends CmdBase {
  static desc: string = 'Select Page mode'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cm.html
 */
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

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cr.html
 */
@register(['ESC', 'R'])
export class SelectInternationalCharacterSet extends CmdBase {
  static desc: string = 'Select an international character set'

  @u8([[0, 17]])
  n: number

  constructor(ics: InternationalCharacterSet) {
    super()
    this.n = InternationalCharacterSetToNumber[ics]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cs.html
 */
@register(['ESC', 'S'])
export class SelectStandardMode extends CmdBase {
  static override desc: string = 'Select Standard mode'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_ct.html
 */
@register(['ESC', 'T'])
export class SelectPrintDirectionInPageMode extends CmdBase {
  static desc: string = 'Select print direction in Page mode'

  @u8([[0, 255]])
  n: number

  constructor(direction: PrintDirection) {
    super()
    this.n = PrintDirectionToNumber[direction]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cv.html
 */
@register(['ESC', 'V'])
export class SetRotationMode extends CmdBase {
  static desc: string = 'Turn 90° clockwise rotation mode on/off'

  @u8([
    [0, 2],
    [48, 50],
  ])
  n: number

  constructor(mode: ClockwiseRotationMode) {
    super()
    this.n = ClockwiseRotationModeToNumber[mode]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_cw.html
 */
@register(['ESC', 'W'])
export class SetPrintAreaInPageMode extends CmdBase {
  static desc: string = 'Set print area in Page mode'

  @u16([[0, 65535]])
  x: number

  @u16([[0, 65535]])
  y: number

  @u16([[1, 65535]])
  dx: number

  @u16([[1, 65535]])
  dy: number

  constructor(x: number, y: number, dx: number, dy: number) {
    super()
    this.x = x
    this.y = y
    this.dx = dx
    this.dy = dy
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_backslash.html
 */
export class SetRelativePrintPosition extends CmdBase {
  static desc: string = 'Set relative print position'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_la.html
 */
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

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lc_3.html
 */
@register(['ESC', 'c', '3'])
export class SelectPaperSensorsToOutputPaperEndSignals extends CmdBase {
  static desc: string = 'Select paper sensor(s) to output paper-end signals'

  @u8([[0, 255]])
  n: number

  constructor(sensors: PaperSensor[]) {
    super()
    this.n = sensors
      .map((sensor) => PaperSensorToNumber[sensor])
      .reduce((a, b) => a | b)
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lc_4.html
 */
@register(['ESC', 'c', '4'])
export class SelectPaperSensorsToStopPrinting extends CmdBase {
  static desc: string = 'Select paper sensor(s) to stop printing'

  @u8([[0, 255]])
  n: number

  constructor(sensors: PaperSensor[]) {
    super()
    this.n = sensors
      .map((sensor) => PaperSensorToNumber[sensor])
      .reduce((a, b) => a | b)
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lc_5.html
 */
export class EnableOrDisablePanelButtons extends CmdBase {
  static desc: string = 'Enable/disable panel buttons'
}

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

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_li.html
 */
@register(['ESC', 'i'])
export class PartialCutOnePointLeftUncut extends CmdBase {
  static desc: string = 'Partial cut (one point left uncut)'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lm.html
 */
@register(['ESC', 'm'])
export class PartialCutThreePointsLeftUncut extends CmdBase {
  static desc: string = 'Partial cut (three points left uncut)'

  constructor() {
    super()
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lp.html
 */
export class GeneratePulse extends CmdBase {
  static desc: string = 'Generate pulse'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lt.html
 */
export class SelectCharacterCodeTable extends CmdBase {
  static desc: string = 'Select character code table'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lu.html
 */
export class TransmitPeripheralDeviceStatus extends CmdBase {
  static desc: string = 'Transmit peripheral device status'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lv.html
 */
export class TransmitPaperSensorStatus extends CmdBase {
  static desc: string = 'Transmit paper sensor status'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/esc_lbrace.html
 */
@register(['ESC', '{'])
export class SetUpsideDownPrintMode extends CmdBase {
  static desc: string = 'Turn upside-down print mode on/off'

  @u8([[0, 255]])
  n: number

  constructor(mode: UpsideDownPrintMode) {
    super()
    this.n = UpsideDownPrintModeToNumber[mode]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_exclamation.html
 */
export class fs_exclamation extends CmdBase {
  static desc: string = 'Select print mode(s) for Kanji characters'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_ampersand.html
 */
export class fs_ampersand extends CmdBase {
  static desc: string = 'Select Kanji character mode'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ca_fn48.html
 */
@registerMultiFn(['FS', '(', 'A'], { skip: 2, fns: [48] })
export class SelectKanjiCharacterFont extends CmdBase {
  static override desc: string = 'Select Kanji character style(s)'

  @u16([2])
  p: number

  @u8([48])
  fn: number

  @u8([0, 1, 48, 49])
  m: number

  constructor(m: number) {
    super()
    this.p = 2
    this.fn = 48
    this.m = m
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn60.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fns: [60] })
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

  // TODO args needs enum
  constructor(c: number) {
    super()
    this.p = 6
    this.fn = 60
    this.m = 2
    this.c = c
    this.d1 = 67
    this.d2 = 76
    this.d3 = 82
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn61.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fns: [61] })
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

  // TODO args needs enum
  constructor(c: number) {
    super()
    this.p = 3
    this.fn = 61
    this.m = 2
    this.c = c
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn62.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fns: [62] })
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

  // TODO args needs enum
  constructor(kc1: number, kc2: number, a: number, n: number) {
    super()
    this.p = 6
    this.fn = 62
    this.m = 2
    this.kc1 = kc1
    this.kc2 = kc2
    this.a = a
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn63.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fns: [63] })
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

  // TODO args needs enum
  constructor(kc1: number, kc2: number, a: number) {
    super()
    this.p = 5
    this.fn = 63
    this.m = 2
    this.kc1 = kc1
    this.kc2 = kc2
    this.a = a
    this.validate()
  }
}

/**
 * NOTE this command has interleaved
 * NOTE this command can vary in size
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn64.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fns: [64] })
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

  // TODO args needs enum
  constructor(p: number, settings: Buffer) {
    super()
    this.p = p
    this.fn = 64
    this.m = 2
    this.settings = settings
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lparen_ce_fn65.html
 */
@registerMultiFn(['FS', '(', 'E'], { skip: 2, fns: [65] })
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

  // TODO args needs enum
  constructor(a: number, n: number) {
    super()
    this.p = 4
    this.fn = 65
    this.m = 2
    this.a = a
    this.n = n
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_minus.html
 */
export class fs_minus extends CmdBase {
  static desc: string = 'Turn underline mode on/off for Kanji characters'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_period.html
 */
export class fs_period extends CmdBase {
  static desc: string = 'Cancel Kanji character mode'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_2.html
 */
export class fs_2 extends CmdBase {
  static desc: string = 'Define user-defined Kanji characters'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_cc.html
 */
export class fs_cc extends CmdBase {
  static desc: string = 'Select Kanji character code system'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_cs.html
 */
export class fs_cs extends CmdBase {
  static desc: string = 'Set Kanji character spacing'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_cw.html
 */
export class fs_cw extends CmdBase {
  static desc: string = 'Turn quadruple-size mode on/off for Kanji characters'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lg_1.html
 */
export class fs_lg_1 extends CmdBase {
  static desc: string = 'Write to NV user memory'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lg_2.html
 */
export class fs_lg_2 extends CmdBase {
  static desc: string = 'Read from NV user memory'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lp.html
 */
export class fs_lp extends CmdBase {
  static desc: string = 'Print NV bit image'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/fs_lq.html
 */
export class fs_lq extends CmdBase {
  static desc: string = 'Define NV bit image'
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
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_dollarssign.html
 */
export class gs_dollarssign extends CmdBase {
  static desc: string = 'Set absolute vertical print position in Page mode'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ca.html
 */
export class gs_lparen_ca extends CmdBase {
  static desc: string = 'Execute test print'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cd.html
 */
export class gs_lparen_cd extends CmdBase {
  static desc: string = 'Enable/disable real-time command'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce.html
 */
export class gs_lparen_ce extends CmdBase {
  static desc: string = 'Set user setup commands'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn01.html
 */
export class gs_lparen_ce_fn01 extends CmdBase {
  static desc: string = 'Change into the user setting mode'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn02.html
 */
export class gs_lparen_ce_fn02 extends CmdBase {
  static desc: string = 'End the user setting mode session'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn05.html
 */
export class gs_lparen_ce_fn05 extends CmdBase {
  static desc: string = 'Set the customized setting values'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn06.html
 */
export class gs_lparen_ce_fn06 extends CmdBase {
  static desc: string = 'Transmit the customized setting values'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn11.html
 */
export class gs_lparen_ce_fn11 extends CmdBase {
  static desc: string = 'Set the configuration item for the serial interface'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn12.html
 */
export class gs_lparen_ce_fn12 extends CmdBase {
  static desc: string =
    'Transmit the configuration item for the serial interface'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn13.html
 */
export class gs_lparen_ce_fn13 extends CmdBase {
  static desc: string = 'Set the configuration item for the Bluetooth interface'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn14.html
 */
export class gs_lparen_ce_fn14 extends CmdBase {
  static desc: string =
    'Transmit the configuration item for the Bluetooth interface'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn15.html
 */
export class gs_lparen_ce_fn15 extends CmdBase {
  static desc: string = 'Set conditions for USB interface communication'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ce_fn16.html
 */
export class gs_lparen_ce_fn16 extends CmdBase {
  static desc: string = 'Transmit conditions for USB interface communication'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ch.html
 */
export class gs_lparen_ch extends CmdBase {
  static desc: string = 'Request transmission of response or status'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ch_fn48.html
 */
export class gs_lparen_ch_fn48 extends CmdBase {
  static desc: string = 'Specifies the process ID response'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ck.html
 */
export class gs_lparen_ck extends CmdBase {
  static desc: string = 'Select print control method(s)'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ck_fn50.html
 */
export class gs_lparen_ck_fn50 extends CmdBase {
  static desc: string = 'Select the print speed'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_ck_fn97.html
 */
export class gs_lparen_ck_fn97 extends CmdBase {
  static desc: string =
    'Select the number of parts for the thermal head energizing'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl.html
 */
export class gs_lparen_cl extends CmdBase {
  static desc: string = 'Set graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn48.html
 */
export class gs_lparen_cl_fn48 extends CmdBase {
  static desc: string = 'Transmit the NV graphics memory capacity'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn50.html
 */
export class gs_lparen_cl_fn50 extends CmdBase {
  static desc: string = 'Print the graphics data in the print buffer'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn51.html
 */
export class gs_lparen_cl_fn51 extends CmdBase {
  static desc: string =
    'Transmit the remaining capacity of the NV graphics memory'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn52.html
 */
export class gs_lparen_cl_fn52 extends CmdBase {
  static desc: string =
    'Transmit the remaining capacity of the download graphics memory'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn64.html
 */
export class gs_lparen_cl_fn64 extends CmdBase {
  static desc: string = 'Transmit the key code list for defined NV graphics'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn65.html
 */
export class gs_lparen_cl_fn65 extends CmdBase {
  static desc: string = 'Delete all NV graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn66.html
 */
export class gs_lparen_cl_fn66 extends CmdBase {
  static desc: string = 'Delete the specified NV graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn67.html
 */
export class gs_lparen_cl_fn67 extends CmdBase {
  static desc: string = 'Define the NV graphics data (raster format)'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn69.html
 */
export class gs_lparen_cl_fn69 extends CmdBase {
  static desc: string = 'Print the specified NV graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn80.html
 */
export class gs_lparen_cl_fn80 extends CmdBase {
  static desc: string =
    'Transmit the key code list for defined download graphics'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn81.html
 */
export class gs_lparen_cl_fn81 extends CmdBase {
  static desc: string = 'Delete all download graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn82.html
 */
export class gs_lparen_cl_fn82 extends CmdBase {
  static desc: string = 'Delete the specified download graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn83.html
 */
export class gs_lparen_cl_fn83 extends CmdBase {
  static desc: string = 'Define the download graphics data (raster format)'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn85.html
 */
export class gs_lparen_cl_fn85 extends CmdBase {
  static desc: string = 'Print the specified download graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_cl_fn112.html
 */
export class gs_lparen_cl_fn112 extends CmdBase {
  static desc: string =
    'Store the graphics data in the print buffer (raster format)'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk.html
 */
export class gs_lparen_lk extends CmdBase {
  static desc: string = 'Set up and print the symbol'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn065.html
 */
export class gs_lparen_lk_fn065 extends CmdBase {
  static desc: string = 'PDF417: Set the number of columns in the data region'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn066.html
 */
export class gs_lparen_lk_fn066 extends CmdBase {
  static desc: string = 'PDF417: Set the number of rows'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn067.html
 */
export class gs_lparen_lk_fn067 extends CmdBase {
  static desc: string = 'PDF417: Set the width of the module'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn068.html
 */
export class gs_lparen_lk_fn068 extends CmdBase {
  static desc: string = 'PDF417: Set the row height'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn069.html
 */
export class gs_lparen_lk_fn069 extends CmdBase {
  static desc: string = 'PDF417: Set the error correction level'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn070.html
 */
export class gs_lparen_lk_fn070 extends CmdBase {
  static desc: string = 'PDF417: Select the options'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn080.html
 */
export class gs_lparen_lk_fn080 extends CmdBase {
  static desc: string = 'PDF417: Store the data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn081.html
 */
export class gs_lparen_lk_fn081 extends CmdBase {
  static desc: string =
    'PDF417: Print the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn082.html
 */
export class gs_lparen_lk_fn082 extends CmdBase {
  static desc: string =
    'PDF417: Transmit the size information of the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn165.html
 */
export class gs_lparen_lk_fn165 extends CmdBase {
  static desc: string = 'QR Code: Select the model'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn167.html
 */
export class gs_lparen_lk_fn167 extends CmdBase {
  static desc: string = 'QR Code: Set the size of module'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn169.html
 */
export class gs_lparen_lk_fn169 extends CmdBase {
  static desc: string = 'QR Code: Select the error correction level'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn180.html
 */
export class gs_lparen_lk_fn180 extends CmdBase {
  static desc: string = 'QR Code: Store the data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn181.html
 */
export class gs_lparen_lk_fn181 extends CmdBase {
  static desc: string =
    'QR Code: Print the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn182.html
 */
export class gs_lparen_lk_fn182 extends CmdBase {
  static desc: string =
    'QR Code: Transmit the size information of the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn265.html
 */
export class gs_lparen_lk_fn265 extends CmdBase {
  static desc: string = 'MaxiCode: Select the mode'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn280.html
 */
export class gs_lparen_lk_fn280 extends CmdBase {
  static desc: string = 'MaxiCode: Store the data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn281.html
 */
export class gs_lparen_lk_fn281 extends CmdBase {
  static desc: string =
    'MaxiCode: Print the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn282.html
 */
export class gs_lparen_lk_fn282 extends CmdBase {
  static desc: string =
    'MaxiCode: Transmit the size information of the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn367.html
 */
export class gs_lparen_lk_fn367 extends CmdBase {
  static desc: string = '2-dimensional GS1 DataBar: Set the width of the module'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn371.html
 */
export class gs_lparen_lk_fn371 extends CmdBase {
  static desc: string =
    '2-dimensional GS1 DataBar: GS1 DataBar Expanded Stacked maximum width setting'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn380.html
 */
export class gs_lparen_lk_fn380 extends CmdBase {
  static desc: string =
    '2-dimensional GS1 DataBar: Store data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn381.html
 */
export class gs_lparen_lk_fn381 extends CmdBase {
  static desc: string =
    '2-dimensional GS1 DataBar: Print the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn382.html
 */
export class gs_lparen_lk_fn382 extends CmdBase {
  static desc: string =
    '2-dimensional GS1 DataBar: Transmit the size information of the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn467.html
 */
export class gs_lparen_lk_fn467 extends CmdBase {
  static desc: string = 'Composite Symbology: Set the width of the module'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn471.html
 */
export class gs_lparen_lk_fn471 extends CmdBase {
  static desc: string =
    'Composite Symbology: GS1 DataBar Expanded Stacked maximum width setting'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn472.html
 */
export class gs_lparen_lk_fn472 extends CmdBase {
  static desc: string = 'Composite Symbology: Select HRI character font'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn480.html
 */
export class gs_lparen_lk_fn480 extends CmdBase {
  static desc: string =
    'Composite Symbology: Store the data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn481.html
 */
export class gs_lparen_lk_fn481 extends CmdBase {
  static desc: string =
    'Composite Symbology: Print the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lparen_lk_fn482.html
 */
export class gs_lparen_lk_fn482 extends CmdBase {
  static desc: string =
    'Composite Symbology: Transmit the size information of the symbol data in the symbol storage area'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_asterisk.html
 */
export class gs_asterisk extends CmdBase {
  static desc: string = 'Define downloaded bit image'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_slash.html
 */
export class gs_slash extends CmdBase {
  static desc: string = 'Print downloaded bit image'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_colon.html
 */
export class gs_colon extends CmdBase {
  static desc: string = 'Start/end macro definition'
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
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cd.html
 */
export class gs_cd extends CmdBase {
  static desc: string = 'Specify Windows BMP graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cd_fn67.html
 */
export class gs_cd_fn67 extends CmdBase {
  static desc: string = 'Define Windows BMP NV graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cd_fn83.html
 */
export class gs_cd_fn83 extends CmdBase {
  static desc: string = 'Define Windows BMP download graphics data'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_ch.html
 */
export class gs_ch extends CmdBase {
  static desc: string = 'Select print position of HRI characters'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_ci.html
 */
export class gs_ci extends CmdBase {
  static desc: string = 'Transmit printer ID'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cl.html
 */
export class gs_cl extends CmdBase {
  static desc: string = 'Set left margin'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cp.html
 */
export class gs_cp extends CmdBase {
  static desc: string = 'Set horizontal and vertical motion units'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cv.html
 */
@registerMultiFn(['GS', 'V'], { skip: 0, fns: [0, 1, 48, 49] })
export class CutPaper extends CmdBase {
  static override desc: string =
    'Select cut mode and cut paper (Function A: Cuts the paper)'

  @u8([0, 1, 48, 49])
  m: number

  constructor(shape: CutShape) {
    super()
    this.m = CutShapeToNumber[shape]
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cv.html
 */
@registerMultiFn(['GS', 'V'], { skip: 0, fns: [65, 66] })
export class FeedAndCutPaper extends CmdBase {
  static override desc: string =
    'Select cut mode and cut paper (Function B: Feeds paper and cuts the paper)'

  @u8([65, 66])
  m: number

  @u8([[0, 255]])
  n: number

  constructor(vmu: number, shape: CutShape) {
    super()
    this.m = 65 + CutShapeToNumber[shape]
    this.n = vmu
    this.validate()
  }
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_cw.html
 */
export class gs_cw extends CmdBase {
  static desc: string = 'Set print area width'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_backslash.html
 */
export class gs_backslash extends CmdBase {
  static desc: string = 'Set relative vertical print position in Page mode'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_caret.html
 */
export class gs_caret extends CmdBase {
  static desc: string = 'Execute macro'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_la.html
 */
export class gs_la extends CmdBase {
  static desc: string = 'Enable/disable Automatic Status Back (ASB)'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lb.html
 */
export class gs_lb extends CmdBase {
  static desc: string = 'Turn smoothing mode on/off'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lf.html
 */
export class gs_lf extends CmdBase {
  static desc: string = 'Select font for HRI characters'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lg_0.html
 */
export class gs_lg_0 extends CmdBase {
  static desc: string = 'Initialize maintenance counter'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lg_2.html
 */
export class gs_lg_2 extends CmdBase {
  static desc: string = 'Transmit maintenance counter'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lh.html
 */
export class gs_lh extends CmdBase {
  static desc: string = 'Set barcode height'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lk.html
 */
export class gs_lk extends CmdBase {
  static desc: string = 'Print barcode'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lr.html
 */
export class gs_lr extends CmdBase {
  static desc: string = 'Transmit status'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lv_0.html
 */
export class gs_lv_0 extends CmdBase {
  static desc: string = 'Print raster bit image'
}

/**
 * https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/gs_lw.html
 */
export class gs_lw extends CmdBase {
  static desc: string = 'Set barcode width'
}
