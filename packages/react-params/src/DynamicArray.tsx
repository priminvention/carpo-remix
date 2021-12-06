import type { ArrayParamProps } from './types';

import { Button } from 'antd';
import React from 'react';

import Param from './Param';

const DynamicArray: React.FC<ArrayParamProps> = ({ onChange, paramType, value }) => {
  return (
    <div>
      {value?.map((v, index) => (
        <Param
          key={index}
          onChange={(_v) => {
            onChange?.(value.map((v, i) => (index === i ? _v : v)));
          }}
          paramType={paramType.arrayChildren}
          value={v}
        />
      ))}
      <Button.Group>
        <Button
          onClick={() => {
            onChange?.(value?.slice(0, -1) ?? []);
          }}
        >
          Minus
        </Button>
        <Button
          onClick={() => {
            onChange?.(value ? [...value].concat(Array.from({ length: 1 })) : Array.from({ length: 1 }));
          }}
          type='primary'
        >
          Add
        </Button>
      </Button.Group>
    </div>
  );
};

export default React.memo(DynamicArray);
