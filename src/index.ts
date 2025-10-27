import assert from 'node:assert'

// TODO eventually, this will be made obsolete by Decorator Metadata,
// which is one stage away from standardization at the time of writing:
// https://github.com/tc39/proposal-decorator-metadata
import 'reflect-metadata'

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

abstract class CmdBase {
  abstract desc: string
}

class InitPrinter extends CmdBase {
  override desc: string = 'Initialize printer'
}

const serFmtMetadataKey = Symbol('serFmt')
const kRegisterMetadataKey = Symbol('register')

class SelectBitImageMode extends CmdBase {
  override desc: string = 'Select bit-image mode'

  @register
  @serFmt('u8')
  m: number

  @register
  @serFmt('u16')
  n: number

  @register
  @serFmt('u8[]')
  d: Buffer

  // TODO need a constructor for when we are building an ESC/POS command
  // sequence. should take string-backed enums instead of raw numbers, but
  // maybe it's ok to start with raw numbers since it might be easier to
  // generate that code? then each ctor can be tweaked per command.

  serialize(): Buffer {
    // TODO need to get the prelude, which is static in nature but this is a
    // non-static context. so it probably needs to come from reflect metadata
    const members = Reflect.getMetadata(kRegisterMetadataKey, this)
    const bytes: number[] = []
    for (const member of members) {
      const format = Reflect.getMetadata(serFmtMetadataKey, this, member)
      if (format === 'u8[]') {
        bytes.push(...this[member])
      } else {
        bytes.push(...toBytesLE(this[member], format))
      }
    }
    return Buffer.from(bytes)
  }

  static from(buf: Buffer) {
    // NOTE prelude has already been consumed at this point; just populate the
    // args now.
    const self = new SelectBitImageMode()
    self.m = 0
    self.n = 0
    self.d = Buffer.from([1, 2, 3])
    return self
  }
}

// TODO use UInt8Array instead of Buffer so browsers can use it too without
// needing a polyfill
function toBytesLE(n: number, format: string): number[] {
  let buf: Buffer
  switch (format) {
    case 'u8':
      buf = Buffer.alloc(1)
      buf.writeUInt8(n)
      break
    case 'u16':
      buf = Buffer.alloc(2)
      buf.writeUInt16LE(n)
      break
    case 'u32':
      buf = Buffer.alloc(4)
      buf.writeUInt32LE(n)
      break
  }
  return Array.from(buf)
}

function register(target, propertyKey: string) {
  const memberList = Reflect.getMetadata(kRegisterMetadataKey, target) ?? []
  memberList.push(propertyKey)
  Reflect.defineMetadata(kRegisterMetadataKey, memberList, target)
}

function serFmt(arg: string) {
  return Reflect.metadata(serFmtMetadataKey, arg)
}

console.log(SelectBitImageMode.from(Buffer.from([0x1b, 0x2a, 0x00, 0x01, 0x01, 0x05, 0x06, 0x07])).serialize())

export function parse(buf: Buffer) {
  return []
}
