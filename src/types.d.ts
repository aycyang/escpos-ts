type UnsignedInt = 'u8' | 'u16' | 'u32'
type VariableSize = { member: string, offset?: number }
type SerialFormat = UnsignedInt | VariableSize
