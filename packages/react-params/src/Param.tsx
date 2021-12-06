import { Alert } from 'antd';
import React, { useMemo } from 'react';

import { findComponents } from './findComponents';
import { ParamProps } from './types';

type Props = ParamProps;

const Param: React.FC<Props> = ({ name, onChange, paramType, placeholder, value }) => {
  const Component = useMemo(() => findComponents(paramType), [paramType]);

  return (
    <div style={{ padding: 5 }}>
      <div>
        {paramType.name || name}({paramType.baseType})
      </div>
      <div>
        {Component ? (
          <Component onChange={onChange} paramType={paramType} placeholder={placeholder} value={value} />
        ) : (
          <Alert message={`Don't support baseType ${paramType.baseType}`} type='error' />
        )}
      </div>
    </div>
  );
};

export default React.memo(Param);
