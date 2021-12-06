import type { UintParamProps } from './types';

import React from 'react';

import { BaseString } from '.';

const Uint: React.FC<UintParamProps> = (props) => {
  return <BaseString {...props} placeholder={`${props.paramType.baseType}`} />;
};

export default React.memo(Uint);
