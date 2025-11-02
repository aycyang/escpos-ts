import assert from 'node:assert'

// TODO eventually, this will be made obsolete by the Decorator Metadata
// feature, which is one stage away from standardization at the time of
// writing: https://github.com/tc39/proposal-decorator-metadata
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

function asciiArrayToBytes(ascii: Ascii[]): number[] {
  return ascii.map(a => kAsciiToByte[a])
}

const kParseTree = []

// --- DECORATORS ---
const kSerialMetadataKey = Symbol('serial')
const kPreludeMetadataKey = Symbol('prelude')
const kRegisterMetadataKey = Symbol('register')
// --- END OF DECORATORS ---

class CmdBase {
  static desc: string

  serialize(): Buffer {
    const prelude = Reflect.getMetadata(kPreludeMetadataKey, this.constructor)
    const bytes = asciiArrayToBytes(prelude)
    const members = Reflect.getMetadata(kRegisterMetadataKey, this)
    for (const member of members) {
      const format = Reflect.getMetadata(kSerialMetadataKey, this, member)
      bytes.push(...toBytesLE(this[member], format))
    }
    return Buffer.from(bytes)
  }

  evalFormat(format: SerialFormat): UnsignedInt | number {
    switch (format) {
      case 'u32':
      case 'u16':
      case 'u8':
        return format
      default:
        return this[format.member] + (format.offset ?? 0)
    }
  }

  // TODO throw parse error if end of buffer is reached prematurely
  static from(buf: Buffer): [any, number] {
    // NOTE prelude has already been consumed at this point; just populate the
    // args now.
    const instance = new this()
    const members = Reflect.getMetadata(kRegisterMetadataKey, this.prototype)
    if (!members) {
      return [instance, 0]
    }
    let offset = 0
    for (const member of members) {
      const format = Reflect.getMetadata(kSerialMetadataKey, this.prototype, member)
      // TODO there must be a better way to differentiate behavior between buffers and uints
      const normalizedFormat = instance.evalFormat(format)
      const [value, newOffset] = fromBytesLE(buf, normalizedFormat, offset)
      instance[member] = value
      offset = newOffset
    }
    return [instance, offset]
  }


}

@prelude(['ESC', '@'])
export class InitPrinter extends CmdBase {
  static override desc: string = 'Initialize printer'
}

@prelude(['ESC', '*'])
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


function fromBytesLE(buf: Buffer, format: UnsignedInt | number, offset: number): [number | Buffer, number] {
  switch (format) {
    case 'u8':
      return [buf.readUint8(offset), offset + 1]
    case 'u16':
      return [buf.readUint16LE(offset), offset + 2]
    case 'u32':
      return [buf.readUint32LE(offset), offset + 4]
    default:
      return [buf.subarray(offset, offset + format), offset + format]
  }
}

// TODO use UInt8Array instead of Buffer so browsers can use it too without
// needing a polyfill
function toBytesLE(n: any, format: string): number[] {
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
    default:
      buf = n
  }
  return Array.from(buf)
}

// --- DECORATORS ---

type Decorator = (target, propertyKey: string) => (void)
type UnsignedInt = 'u8' | 'u16' | 'u32'
type VariableSize = { member: string, offset?: number }
type SerialFormat = UnsignedInt | VariableSize

function compose(decorators: Decorator[]): Decorator {
  return (target, propertyKey) => {
    for (const decorator of decorators) {
      decorator(target, propertyKey)
    }
  }
}

function register(target, propertyKey: string) {
  const memberList = Reflect.getMetadata(kRegisterMetadataKey, target) ?? []
  memberList.push(propertyKey)
  Reflect.defineMetadata(kRegisterMetadataKey, memberList, target)
}

function serial(arg: SerialFormat) {
  return compose([register, Reflect.metadata(kSerialMetadataKey, arg)])
}

function registerCmd(prelude: Ascii[], target) {
  let cur = kParseTree
  let i = 0
  while (i < prelude.length - 1) {
    const b = kAsciiToByte[prelude[i]]
    cur[b] ??= []
    cur = cur[b]
    i++
  }
  const b = kAsciiToByte[prelude[i]]
  cur[b] = target
}

function prelude(arg: Ascii[]) {
  return target => {
    registerCmd(arg, target)
    Reflect.defineMetadata(kPreludeMetadataKey, arg, target)
  }
}
// --- END OF DECORATORS ---

class ParseError extends Error {}

export function parse(buf: Buffer) {
  const cmds = []
  let cur = kParseTree
  let i = 0
  while (i < buf.length) {
    const b = buf[i]
    if (!(b in cur)) {
      throw new ParseError(`unexpected token: ${b}`)
    }
    cur = cur[b]
    if (typeof cur === 'function') { // ctor
      const ctor = cur as any
      const [instance, bytesRead] = ctor.from(buf.subarray(i + 1))
      cmds.push(instance)
      i += bytesRead + 1
      cur = kParseTree
    } else {
      i++
    }
  }
  if (cur !== kParseTree) {
    throw new ParseError(`unexpected end of buffer`)
  }
  return cmds
}
