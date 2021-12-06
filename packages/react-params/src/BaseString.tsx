import type { ChangeEvent } from 'react';
import type { StringParamProps } from './types';

import { Input } from 'antd';
import React, { useCallback } from 'react';

const BaseString: React.FC<StringParamProps> = ({ onChange, placeholder, value }) => {
  const _onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e.target.value);
    },
    [onChange]
  );

  return (
    <>
      <Input onChange={_onChange} placeholder={placeholder || `String value`} value={value} />
    </>
  );
};

export default React.memo(BaseString);
