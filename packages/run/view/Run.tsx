import type { Uri } from '@carpo/common/types';

import { sendMessage } from '@carpo/common/sendMessage';
import { RowItem, useRedspot } from '@carpo/react-components';
import { Button, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const Run: React.FC = () => {
  const [scripts, setScripts] = useState<Uri[]>([]);
  const { workspacePath } = useRedspot();
  const [selectFile, setSelectFile] = useState<string>();
  const [running, setRunning] = useState(false);

  useEffect(() => {
    sendMessage('redspot.subScripts', null, setScripts).then(setScripts).catch(console.error);
  }, []);

  const run = useCallback(async (): Promise<void> => {
    if (selectFile) {
      setRunning(true);

      await sendMessage('redspot.run', selectFile).finally(() => setRunning(false));
    }
  }, [selectFile]);

  return (
    <>
      <RowItem label='Select'>
        <Select<string> onChange={setSelectFile} placeholder='Select script to run'>
          {scripts.map((script) => (
            <Select.Option key={script.path} value={script.path}>
              {script.path.replace(workspacePath || '', '').replace(/^\//, '')}
            </Select.Option>
          ))}
        </Select>
      </RowItem>
      <Button
        disabled={!selectFile}
        loading={running}
        onClick={run}
        style={{ marginTop: 8, width: '100%' }}
        type='primary'
      >
        {running ? `${selectFile?.replace(workspacePath || '', '').replace(/^\//, '')} running` : 'Run'}
      </Button>
    </>
  );
};

export default React.memo(Run);
