import { Fragment, JsonFragment } from '@ethersproject/abi';
import React, { useEffect, useMemo, useState } from 'react';

import Param from './Param';

interface Props {
  fragmentValue: Fragment | JsonFragment | string;
  onChange?: (value: unknown[]) => void;
}

const FragmentComponent: React.FC<Props> = ({ fragmentValue, onChange }) => {
  const fragment = useMemo(() => Fragment.from(fragmentValue), [fragmentValue]);
  const [inputs, setInputs] = useState<unknown[]>([]);

  useEffect(() => {
    onChange?.(inputs);
  }, [inputs, onChange]);

  return (
    <>
      <div>{fragment.name}</div>
      {fragment.inputs.map((paramType, index) => (
        <Param
          key={index}
          onChange={(value) => {
            setInputs((_inputs) => {
              const newInputs = [..._inputs];

              newInputs[index] = value;

              return newInputs;
            });
          }}
          paramType={paramType}
          value={inputs[index]}
        />
      ))}
    </>
  );
};

export default React.memo(FragmentComponent);
