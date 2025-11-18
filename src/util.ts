export function byteToHex(b: number): string {
  const upper = (b >> 4) & 0x0f
  const lower = b & 0x0f
  return upper.toString(16) + lower.toString(16)
}

function toHexList(nums: number[]): string {
  return nums.map(byteToHex).join(' ')
}

export function bufToAbbrevString(buf: Buffer) {
  if (buf.length <= 8) {
    return `[ ${toHexList([...buf])} ]`
  }
  const start = toHexList([...buf.subarray(0, 3)])
  const end = toHexList([...buf.subarray(-3)])
  return `[ ${start} ... (${buf.length - 6} more) ... ${end} ]`
}
