import type { StringParamProps } from './types';

import React from 'react';

import BaseString from './BaseString';

const Address: React.FC<StringParamProps> = (props) => {
  return <BaseString {...props} placeholder='Input address. eg 0x...' />;
};

export default React.memo(Address);
