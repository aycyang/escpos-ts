import { register, registerMultiFn, parse } from './parse'
import { serial } from './decorators'
export { parse } from './parse'
import { CmdBase } from './cmd'

@register(['HT'])
export class HorizontalTab extends CmdBase {
  static override desc: string = 'Horizontal tab'
}

export class SetCharacterSpacing extends CmdBase {}
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
  m: number
  @serial('u16')
  n: number
  // TODO change type to Uint8Array
  @serial({ member: 'n' })
  d: Buffer
  constructor(m, n, d: Buffer) {
    super()
    // TODO m: replace with string-backed enum
    this.m = m
    // TODO n: infer from buffer length
    this.n = n
    this.d = d
  }
}

export class SetUnderlineMode extends CmdBase {}
export class SelectDefaultLineSpacing extends CmdBase {}
export class SetLineSpacing extends CmdBase {}
export class SelectPeripheralDevice extends CmdBase {}
export class CancelUserDefinedCharacters extends CmdBase {}

@register(['ESC', '@'])
export class InitPrinter extends CmdBase {
  static override desc: string = 'Initialize printer'
}

export class SetHorizontalTabPositions extends CmdBase {}
export class SetEmphasizedMode extends CmdBase {}
export class SetDoubleStrikeMode extends CmdBase {}
export class PrintAndFeedPaper extends CmdBase {}
export class SelectPageMode extends CmdBase {}
export class SelectCharacterFont extends CmdBase {}
export class SelectInternationalCharacterSet extends CmdBase {}
export class SelectStandardMode extends CmdBase {}
export class SelectPrintDirectionInPageMode extends CmdBase {}
export class SetRotationMode extends CmdBase {}
export class SetPrintAreaInPageMode extends CmdBase {}
export class SetRelativePrintPosition extends CmdBase {}
export class SelectJustification extends CmdBase {}
export class SelectPaperSensorsToOutputPaperEndSignals extends CmdBase {}
export class SelectPaperSensorsToStopPrinting extends CmdBase {}
export class EnableOrDisablePanelButtons extends CmdBase {}
export class PrintAndFeedNLines extends CmdBase {}
export class PartialCutOnePointLeftUncut extends CmdBase {}
export class PartialCutThreePointsLeftUncut extends CmdBase {}
export class GeneratePulse extends CmdBase {}
export class SelectCharacterCodeTable extends CmdBase {}
export class TransmitPeripheralDeviceStatus extends CmdBase {}
export class TransmitPaperSensorStatus extends CmdBase {}
export class SetUpsideDownPrintMode extends CmdBase {}

@registerMultiFn(['FS', '(', 'A'], { skip: 2, fn: 48 })
export class SelectKanjiCharacterFont extends CmdBase {
  static override desc: string = 'Select Kanji character style(s)'
  @serial('u16')
  p: number
  @serial('u8')
  fn: number
  @serial('u8')
  m: number
}

@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 60 })
export class CancelSetValuesForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Cancel set values for top/bottom logo printing'
  @serial('u16')
  p: number
  @serial('u8')
  fn: number
  @serial('u8')
  m: number
  @serial('u8')
  c: number
  @serial('u8')
  d1: number
  @serial('u8')
  d2: number
  @serial('u8')
  d3: number
}

@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 61 })
export class TransmitSetValuesForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Transmit set values for top/bottom logo printing'
  @serial('u16')
  p: number
  @serial('u8')
  fn: number
  @serial('u8')
  m: number
  @serial('u8')
  c: number
}

@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 62 })
export class SetTopLogoPrinting extends CmdBase {
  static override desc: string = 'Set top logo printing'
  @serial('u16')
  p: number
  @serial('u8')
  fn: number
  @serial('u8')
  m: number
  @serial('u8')
  kc1: number
  @serial('u8')
  kc2: number
  @serial('u8')
  a: number
  @serial('u8')
  n: number
}

@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 63 })
export class SetBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Set bottom logo printing'
  @serial('u16')
  p: number
  @serial('u8')
  fn: number
  @serial('u8')
  m: number
  // TODO
}

@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 64 })
export class MakeExtendedSettingsForTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Make extended settings for top/bottom logo printing'
  @serial('u16')
  p: number
  @serial('u8')
  fn: number
  @serial('u8')
  m: number
  // TODO
}

@registerMultiFn(['FS', '(', 'E'], { skip: 2, fn: 65 })
export class EnableDisableTopOrBottomLogoPrinting extends CmdBase {
  static override desc: string = 'Enable/disable top/bottom logo printing'
  @serial('u16')
  p: number
  @serial('u8')
  fn: number
  @serial('u8')
  m: number
  @serial('u8')
  a: number
  @serial('u8')
  n: number
}

export class SelectCharacterSize extends CmdBase {}
export class SetInvertColorMode extends CmdBase {}
export class SelectCutModeAndCutPaper extends CmdBase {}
