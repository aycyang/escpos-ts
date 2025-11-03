import { register, parse } from './parse'
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

