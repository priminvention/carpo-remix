import type { ArrayParamProps } from './types';

import React from 'react';

import DynamicArray from './DynamicArray';
import FixArray from './FixArray';

const Array: React.FC<ArrayParamProps> = ({ onChange, paramType, value }) => {
  return (
    <>
      {paramType.arrayLength !== -1 ? (
        <FixArray onChange={onChange} paramType={paramType} value={value} />
      ) : (
        <DynamicArray onChange={onChange} paramType={paramType} value={value} />
      )}
    </>
  );
};

export default React.memo(Array);
