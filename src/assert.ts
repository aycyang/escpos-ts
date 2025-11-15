export function assert(value, msg?: string) {
  if (!value) {
    throw new Error(msg || 'Assertion failed')
  }
}
