import assert from 'node:assert'

type Ascii = 
'NUL' |
'SOH' |
'STX' |
'ETX' |
'EOT' |
'ENQ' |
'ACK' |
'BEL' |
'BS' |
'HT' |
'LF' |
'VT' |
'FF' |
'CR' |
'SO' |
'SI' |
'DLE' |
'DCI' |
'DC2' |
'DC3' |
'DC4' |
'NAK' |
'SYN' |
'ETB' |
'CAN' |
'EM' |
'SUB' |
'ESC' |
'FS' |
'GS' |
'RS' |
'US' |
'SP' |
'!' |
'"' |
'#' |
'$' |
'%' |
'&' |
"'" |
'(' |
')' |
'*' |
'+' |
',' |
'-' |
'.' |
'/' |
'0' |
'1' |
'2' |
'3' |
'4' |
'5' |
'6' |
'7' |
'8' |
'9' |
':' |
';' |
'<' |
'=' |
'>' |
'?' |
'@' |
'A' |
'B' |
'C' |
'D' |
'E' |
'F' |
'G' |
'H' |
'I' |
'J' |
'K' |
'L' |
'M' |
'N' |
'O' |
'P' |
'Q' |
'R' |
'S' |
'T' |
'U' |
'V' |
'W' |
'X' |
'Y' |
'Z' |
'[' |
'\\' |
']' |
'^' |
'_' |
'`' |
'a' |
'b' |
'c' |
'd' |
'e' |
'f' |
'g' |
'h' |
'i' |
'j' |
'k' |
'l' |
'm' |
'n' |
'o' |
'p' |
'q' |
'r' |
's' |
't' |
'u' |
'v' |
'w' |
'x' |
'y' |
'z' |
'{' |
'|' |
'}' |
'~' |
'DEL'

const kAsciiToByte: Record<Ascii, number> = {
  'NUL': 0x00,
  'SOH': 0x01,
  'STX': 0x02,
  'ETX': 0x03,
  'EOT': 0x04,
  'ENQ': 0x05,
  'ACK': 0x06,
  'BEL': 0x07,
  'BS': 0x08,
  'HT': 0x09,
  'LF': 0x0a,
  'VT': 0x0b,
  'FF': 0x0c,
  'CR': 0x0d,
  'SO': 0x0e,
  'SI': 0x0f,
  'DLE': 0x10,
  'DCI': 0x11,
  'DC2': 0x12,
  'DC3': 0x13,
  'DC4': 0x14,
  'NAK': 0x15,
  'SYN': 0x16,
  'ETB': 0x17,
  'CAN': 0x18,
  'EM': 0x19,
  'SUB': 0x1a,
  'ESC': 0x1b,
  'FS': 0x1c,
  'GS': 0x1d,
  'RS': 0x1e,
  'US': 0x1f,
  'SP': 0x20,
  '!': 0x21,
  '"': 0x22,
  '#': 0x23,
  '$': 0x24,
  '%': 0x25,
  '&': 0x26,
  "'": 0x27,
  '(': 0x28,
  ')': 0x29,
  '*': 0x2a,
  '+': 0x2b,
  ',': 0x2c,
  '-': 0x2d,
  '.': 0x2e,
  '/': 0x2f,
  '0': 0x30,
  '1': 0x31,
  '2': 0x32,
  '3': 0x33,
  '4': 0x34,
  '5': 0x35,
  '6': 0x36,
  '7': 0x37,
  '8': 0x38,
  '9': 0x39,
  ':': 0x3a,
  ';': 0x3b,
  '<': 0x3c,
  '=': 0x3d,
  '>': 0x3e,
  '?': 0x3f,
  '@': 0x40,
  'A': 0x41,
  'B': 0x42,
  'C': 0x43,
  'D': 0x44,
  'E': 0x45,
  'F': 0x46,
  'G': 0x47,
  'H': 0x48,
  'I': 0x49,
  'J': 0x4a,
  'K': 0x4b,
  'L': 0x4c,
  'M': 0x4d,
  'N': 0x4e,
  'O': 0x4f,
  'P': 0x50,
  'Q': 0x51,
  'R': 0x52,
  'S': 0x53,
  'T': 0x54,
  'U': 0x55,
  'V': 0x56,
  'W': 0x57,
  'X': 0x58,
  'Y': 0x59,
  'Z': 0x5a,
  '[': 0x5b,
  '\\': 0x5c,
  ']': 0x5d,
  '^': 0x5e,
  '_': 0x5f,
  '`': 0x60,
  'a': 0x61,
  'b': 0x62,
  'c': 0x63,
  'd': 0x64,
  'e': 0x65,
  'f': 0x66,
  'g': 0x67,
  'h': 0x68,
  'i': 0x69,
  'j': 0x6a,
  'k': 0x6b,
  'l': 0x6c,
  'm': 0x6d,
  'n': 0x6e,
  'o': 0x6f,
  'p': 0x70,
  'q': 0x71,
  'r': 0x72,
  's': 0x73,
  't': 0x74,
  'u': 0x75,
  'v': 0x76,
  'w': 0x77,
  'x': 0x78,
  'y': 0x79,
  'z': 0x7a,
  '{': 0x7b,
  '|': 0x7c,
  '}': 0x7d,
  '~': 0x7e,
  'DEL': 0x7f,
}

type ArgType = 'u8' | 'u16' | 'u32'
class Arg {
  name: string
  value: number
  type: ArgType
  static from(buf: Buffer, name: string, type: ArgType) {
    const arg = new Arg()
    arg.name = name
    arg.type = type
    // TODO convenience function for reading to/writing from buffer
    switch (type) {
      case 'u8':
        arg.value = buf.readUint8()
        break
      case 'u16':
        arg.value = buf.readUint16LE()
        break
      case 'u32':
        arg.value = buf.readUint32LE()
        break
    }
    return arg
  }
  serialize(): Buffer {
    const buf = Buffer.alloc(4)
    switch (this.type) {
      case 'u8':
        buf.writeUint8(this.value)
        break
      case 'u16':
        buf.writeUint16LE(this.value)
        break
      case 'u32':
        buf.writeUint32LE(this.value)
        break
    }
    return buf
  }
}

// Command should statically define its prelude
// Command should statically define its arg list
// Command should encapsulate its to_bytes procedure, which needs to know prelude and argument rules
// Command instance should encode the command type and arg values
// To build the parse tree, need to be able to iterate over all commands and know the prelude for each command

// Maybe we want prelude and args to be static, and then have a generic method
// to serializes the in-mem representation to bytes, and then subclasses must
// override the static class member.
// To get the static class member of a subclass, ChatGPT suggests taking
// `this.constructor` and typecasting it as an interface that tells Typescript
// that it has all the static members. I don't like this because I have to
// write the class members twice, once for the interface and once on the
// subclass.

// type definition is coupled with in-memory representation. should it be part of the same class?
// type definition needs to be readable by parser and serializer
// maybe code generation is the solution?



interface BaseConstructor<T extends CmdBase> {
  new(...args: any[]): T
  desc: string
  prelude: Ascii[]
  args: Arg[]
}

abstract class CmdBase {
  toBytes(): Buffer {
    const ctor = this.constructor as BaseConstructor<CmdBase>
    return Buffer.from(ctor.prelude.map(a => kAsciiToByte[a]))
  }
}

export class InitPrinter extends CmdBase {
  static desc: string = 'Initialize printer'
  static prelude: Ascii[] = ['ESC', '@']
}

export enum EmphasizedMode {
  Off = 0,
  On = 1,
}

export class SetEmphasizedMode extends CmdBase {
  mode: EmphasizedMode
  constructor(mode: EmphasizedMode) {
    super()
    this.mode = mode
  }
  override desc(): string {
    return 'Turn emphasized mode on/off'
  }
  override prelude(): Ascii[] {
    return ['ESC', 'E']
  }
  static override argRules(): ArgRule[] {
    return [
      { name: 'n', size: 1, isValid: (n) => 0 <= n && n <= 255 },
    ]
  }
}

enum UnderlineMode {
  Off = 0,
  OneDotThick = 1,
  TwoDotsThick = 2,
}

class SetUnderlineMode {
  static desc: string = 'Turn underline mode on/off'
  mode: UnderlineMode
  constructor(mode: UnderlineMode) {
    this.mode = mode
  }
}

enum BitImageMode {
  EightDotSingleDensity = 0,
  EightDotDoubleDensity = 1,
  TwentyFourDotSingleDensity = 32,
  TwentyFourDotDoubleDensity = 33,
}

class SelectBitImageMode {
  static desc: string = 'Select bit-image mode'
  mode: BitImageMode
  data: Buffer
  constructor(mode: BitImageMode, data: Buffer) {
    this.mode = mode
    this.data = data
  }
}

type ArgRule = {
  name: string,
  // Size of the argument in bytes. If more than one, the bytes are to be
  // interpreted as a single little-endian number. If a function, the args
  // parameter is an object containing the arguments parsed thus far, keyed by
  // their canonical names. The return value is the calculated size.
  size: number | ((args: object) => number),
  // Returns true if argument value is valid. The args parameter is an object
  // containing the arguments parsed thus far, keyed by their canonical names.
  // If absent, any value is considered valid.
  isValid?: (value: number, args: object) => boolean,
}

/*
type CmdRule = {
  cmd: Cmd,
  prelude: Ascii[],
  args?: ArgRule[],
}

// These rules are translated relatively directly from the documentation:
// https://download4.epson.biz/sec_pubs/pos/reference_en/escpos/tmt88v.html
// These are used to build the parser state machine.
const rules: CmdRule[] = [
  {
    cmd: InitPrinter,
    prelude: ['ESC', '@'],
  },
  {
    cmd: SetUnderlineMode,
    prelude: ['ESC', '-'],
    args: [
      { name: 'n', offset: 2, size: 1, isValid: (n, _) => n in [0, 1, 2, 48, 49, 50] },
    ],
  },
  {
    cmd: SelectBitImageMode,
    prelude: ['ESC', '*'],
    args: [
      { name: 'm', offset: 2, size: 1, isValid: (m, _) => m in [0, 1, 32, 33] },
      { name: 'n', offset: 3, size: 2, isValid: (n, _) => 1 <= n && n <= 2047 },
      { name: 'd', offset: 5, size: args => args['n'] * (args['m'] >= 32 ? 3 : 1) },
    ],
  },
]
*/

const cmds: CmdBase[] = [
  InitPrinter,
  SetEmphasizedMode,
]

const parseTree = {}

for (const cmd of cmds) {
}

export function parse(buf: Buffer): CmdBase[] {
  return []
}

