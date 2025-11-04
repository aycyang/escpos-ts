import { register, registerMultiFn, parse } from './parse'
import { serial } from './decorators'
export { parse } from './parse'
import { CmdBase } from './cmd'

@register(['HT'])
export class HorizontalTab extends CmdBase {
  static override desc: string = 'Horizontal tab'
}

@register(['ESC', '@'])
export class InitPrinter extends CmdBase {
  static override desc: string = 'Initialize printer'
}

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
export class CancelSetValuesForTopBottomLogoPrinting extends CmdBase {
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
export class TransmitSetValuesForTopBottomLogoPrinting extends CmdBase {
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
