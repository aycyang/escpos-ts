export function byteToHex(b: number): string {
  const upper = (b >> 4) & 0x0f
  const lower = b & 0x0f
  return upper.toString(16) + lower.toString(16)
}

export function bufToAbbrevString(buf: Buffer) {
  if (buf.length <= 8) {
    return `[ ${buf.join(',')} ]`
  }
  const start = [buf[0], buf[1], buf[2]].map(byteToHex).join(' ')
  const endBuf = buf.subarray(-3)
  const end = [endBuf[0], endBuf[1], endBuf[2]].map(byteToHex).join(' ')
  return `[ ${start} ... (${buf.length - 6} more) ... ${end} ]`
}
