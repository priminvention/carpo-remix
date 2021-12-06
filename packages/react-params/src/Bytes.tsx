import type { BytesParamProps } from './types';

import React from 'react';

import { BaseString } from '.';

const Bytes: React.FC<BytesParamProps> = (props) => {
  return <BaseString {...props} placeholder={`${props.paramType.baseType}`} />;
};

export default React.memo(Bytes);
