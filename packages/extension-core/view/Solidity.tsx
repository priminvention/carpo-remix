import type { SolidityConfig } from '@carpo-remix/config/types';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { Button, Form, Select } from 'antd';
import React, { useEffect, useState } from 'react';

interface Props {
  onDone: (solidity: SolidityConfig) => void;
}

const Solidity: React.FC<Props> = ({ onDone }) => {
  const [version, setVersion] = useState();
  const [releases, setReleases] = useState<Record<string, string>>({});

  useEffect(() => {
    sendMessage('solidity.releases', null).then(setReleases).catch(console.error);
  }, []);

  return (
    <>
      <h2>Solidity config</h2>
      <Form layout='vertical'>
        <Form.Item label='Version'>
          <Select onSelect={setVersion} value={version}>
            {Object.keys(releases).map((release) => (
              <Select.Option key={release} value={release}>
                {release}
              </Select.Option>
            ))}
          </Select>
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
