import type { PathsConfig } from '@carpo-remix/config/types';

import React, { useState } from 'react';

import Paths from './Paths';
import Solidity from './Solidity';

const Root: React.FC = () => {
  const [steps, setSteps] = useState(0);
  const [paths, setPaths] = useState<PathsConfig>();

  return (
    <>
      {steps === 0 && (
        <Paths
          onDone={(paths) => {
            setPaths(paths);
            setSteps((steps) => steps + 1);
          }}
        />
      )}
      {steps === 1 && (
        <Solidity
          onDone={(...args) => {
            console.log(args);
          }}
        />
      )}
    </>
  );
};

export default Root;
