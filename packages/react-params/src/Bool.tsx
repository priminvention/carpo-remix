import type { ParamProps } from './types';

import { Switch } from 'antd';
import React, { useCallback } from 'react';

type Props = ParamProps<boolean>;

const Bool: React.FC<Props> = ({ onChange, value }) => {
  const _onChange = useCallback(
    (checked: boolean) => {
      onChange?.(checked);
    },
    [onChange]
  );

  return (
    <>
      <Switch checked={value} onChange={_onChange} />
    </>
  );
};

export default React.memo(Bool);
