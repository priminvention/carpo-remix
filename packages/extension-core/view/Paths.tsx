import type { PathsConfig } from '@carpo-remix/config/types';

import { Button, Form, Input } from 'antd';
import React, { useState } from 'react';

interface Props {
  onDone: (paths: PathsConfig) => void;
}

const Paths: React.FC<Props> = ({ onDone }) => {
  const [sources, setSources] = useState('contracts');
  const [artifacts, setArtifacts] = useState('artifacts');
  const [tests, setTests] = useState('tests');

  return (
    <>
      <h2>Path config</h2>
      <Form layout='vertical'>
        <Form.Item label='Source path'>
          <Input onChange={(e) => setSources(e.target.value)} value={sources} />
        </Form.Item>
        <Form.Item label='Artifacts path'>
          <Input onChange={(e) => setArtifacts(e.target.value)} value={artifacts} />
        </Form.Item>
        <Form.Item label='Test path'>
          <Input onChange={(e) => setTests(e.target.value)} value={tests} />
        </Form.Item>
        <Form.Item>
          <Button onClick={() => onDone({ sources, artifacts, tests })} type='primary'>
            Next step
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default React.memo(Paths);
