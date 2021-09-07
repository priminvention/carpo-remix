import type { Uri } from '@carpo/common/types';

import { sendMessage } from '@carpo/common/sendMessage';
import { RowItem, useRedspot } from '@carpo/react-components';
import { Button, Select, Switch } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const Test: React.FC = () => {
  const { workspacePath } = useRedspot();

  const [noCompile, setNoCompile] = useState(false);
  const [testFiles, setTestFiles] = useState<Uri[]>([]);
  const [selectFile, setSelectFile] = useState<string>();
  const [runningOne, setRunningOne] = useState(false);
  const [runningAll, setRunningAll] = useState(false);

  useEffect(() => {
    sendMessage('redspot.subTestFiles', null, setTestFiles).then(setTestFiles).catch(console.error);
  }, []);

  const testOne = useCallback(async (): Promise<void> => {
    if (selectFile) {
      setRunningOne(true);

      await sendMessage('redspot.test', {
        noCompile,
        filePath: selectFile
      }).finally(() => setRunningOne(false));
    }
  }, [noCompile, selectFile]);

  const testAll = useCallback(async (): Promise<void> => {
    setRunningAll(true);

    await sendMessage('redspot.test', {
      noCompile
    }).finally(() => setRunningAll(false));
  }, [noCompile]);

  return (
    <>
      <RowItem label='Select file'>
        <Select<string> onChange={setSelectFile} placeholder='Select test file'>
          {testFiles.map((file) => (
            <Select.Option key={file.path} value={file.path}>
              {file.path.replace(workspacePath || '', '').replace(/^\//, '')}
            </Select.Option>
          ))}
        </Select>
      </RowItem>
      <RowItem label='no-compile'>
        <Switch checked={noCompile} onChange={setNoCompile} />
      </RowItem>
      <Button.Group style={{ marginTop: 8, width: '100%' }}>
        <Button loading={runningAll} onClick={testAll} style={{ width: '100%' }}>
          {runningAll ? 'Testing' : 'Test all'}
        </Button>
        <Button disabled={!selectFile} loading={runningOne} onClick={testOne} style={{ width: '100%' }} type='primary'>
          {runningOne ? `${selectFile?.replace(workspacePath || '', '').replace(/^\//, '')} ...` : 'Test one'}
        </Button>
      </Button.Group>
    </>
  );
};

export default React.memo(Test);
