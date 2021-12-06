import type { ArrayParamProps } from './types';

import React from 'react';

import Param from './Param';

const FixArray: React.FC<ArrayParamProps> = ({ onChange, paramType, value }) => {
  return (
    <div style={{ paddingLeft: 8 }}>
      {Array.from({ length: paramType.arrayLength }).map((_, index) => (
        <Param
          key={index}
          name={`index ${index}`}
          onChange={(_value) => {
            const newValue = value ? [...value] : Array.from({ length: paramType.arrayLength });

            newValue[index] = _value;

            onChange?.(newValue);
          }}
          paramType={paramType.arrayChildren}
        />
      ))}
    </div>
  );
};

export default React.memo(FixArray);
