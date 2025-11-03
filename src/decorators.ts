import { kSerialMetadataKey, kRegisterMetadataKey } from './symbols'

// TODO eventually, this will be made obsolete by the Decorator Metadata
// feature, which is one stage away from standardization at the time of
// writing: https://github.com/tc39/proposal-decorator-metadata
import 'reflect-metadata'

function compose(decorators: Decorator[]): Decorator {
  return (target, propertyKey) => {
    for (const decorator of decorators) {
      decorator(target, propertyKey)
    }
  }
}

function registerMember(target, propertyKey: string) {
  const memberList = Reflect.getMetadata(kRegisterMetadataKey, target) ?? []
  memberList.push(propertyKey)
  Reflect.defineMetadata(kRegisterMetadataKey, memberList, target)
}

export function serial(arg: SerialFormat) {
  return compose([registerMember, Reflect.metadata(kSerialMetadataKey, arg)])
}

