import type { PathsConfig, SolidityConfig } from '@carpo-remix/config/types';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import React, { useCallback, useState } from 'react';

import Paths from './Paths';
import Solidity from './Solidity';

const Root: React.FC = () => {
  const [steps, setSteps] = useState(0);
  const [paths, setPaths] = useState<PathsConfig>();
  const [solidity, setSolidity] = useState<SolidityConfig>();

  const done = useCallback((paths?: PathsConfig, solidity?: SolidityConfig) => {
    sendMessage('carpo-core.genConfig', { paths, solidity }).catch(console.error);
  }, []);

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
          onDone={(solidity) => {
            setSolidity(solidity);
            done(paths, solidity);
          }}
        />
      )}
    </>
  );
};

export default Root;
