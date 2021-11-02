import type { SolidityConfig } from '@carpo-remix/config/types';

import { SolidityVersion } from '@carpo-remix/react-components';
import { Button, Form } from 'antd';
import React, { useState } from 'react';

interface Props {
  onDone: (solidity: SolidityConfig) => void;
}

const Solidity: React.FC<Props> = ({ onDone }) => {
  const [version, setVersion] = useState<string>();

  return (
    <>
      <h2>Solidity config</h2>
      <Form layout='vertical'>
        <Form.Item label='Version'>
          <SolidityVersion onSelect={setVersion} value={version} />
        </Form.Item>
        <Form.Item>
          <Button onClick={() => onDone({ version })} type='primary'>
            Done
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default React.memo(Solidity);
