import type { ParamType } from '@ethersproject/abi';
import type { FC } from 'react';
import type { ParamProps } from './types';

import { Address, Array as ArrayComponent, BaseString, Bool, Bytes, Int, Tuple, Uint } from '.';

export function findComponents(paramType: ParamType): FC<ParamProps<any>> | null {
  if (paramType.baseType === 'address') {
    return Address;
  } else if (paramType.baseType === 'string') {
    return BaseString;
  } else if (paramType.baseType === 'bool') {
    return Bool;
  } else if (paramType.baseType === 'array') {
    return ArrayComponent;
  } else if (paramType.baseType === 'tuple') {
    return Tuple;
  } else if (paramType.baseType.startsWith('uint')) {
    return Uint;
  } else if (paramType.baseType.startsWith('int')) {
    return Int;
  } else if (paramType.baseType.startsWith('bytes')) {
    return Bytes;
  } else {
    return null;
  }
}
