import type { IntParamProps } from './types';

import React from 'react';

import { BaseString } from '.';

const Int: React.FC<IntParamProps> = (props) => {
  return <BaseString {...props} placeholder={`${props.paramType.baseType}`} />;
};

export default React.memo(Int);
