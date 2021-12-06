import type { TupleParamProps } from './types';

import React from 'react';

import Param from './Param';

const Tuple: React.FC<TupleParamProps> = ({ onChange, paramType, value }) => {
  return (
    <div style={{ paddingLeft: 8 }}>
      {paramType.components.map((param, index) => (
        <Param
          key={index}
          onChange={(_value) => {
            onChange?.({
              ...(value as Record<string, unknown>),
              [param.name]: _value
            });
          }}
          paramType={param}
          value={value?.[param.name]}
        />
      ))}
    </div>
  );
};

export default React.memo(Tuple);
