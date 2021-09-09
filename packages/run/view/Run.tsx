import type { Uri } from '@carpo/common/types';

import { sendMessage } from '@carpo/common/sendMessage';
import { RowItem, RowItemAddition, useRedspot } from '@carpo/react-components';
import { Button, Input, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { NetworksConfig } from 'redspot/types/config';

const Run: React.FC = () => {
  const { config } = useRedspot();
  const [scripts, setScripts] = useState<Uri[]>([]);
  const { workspacePath } = useRedspot();
  const [selectFile, setSelectFile] = useState<string>();
  const [running, setRunning] = useState(false);
  const [networks, setNetworks] = useState(config?.networks);

  useEffect(() => {
    setNetworks(config?.networks);
  }, [config]);

  useEffect(() => {
    sendMessage('redspot.subScripts', null, setScripts).then(setScripts).catch(console.error);
  }, []);

  const run = useCallback(async (): Promise<any> => {
    if (selectFile) {
      setRunning(true);

      await sendMessage('redspot.run', selectFile).finally(() => setRunning(false));

      if (config && config.networks) {
        config.networks = networks as NetworksConfig;
        const newConfig = { ...config };

        return sendMessage('redspot.setConfig', newConfig);
      }
    }
  }, [config, networks, selectFile]);

  return networks ? (
    <>
      {Object.keys(networks).map((type, index) => (
        <div key={index}>
          <span>{type}</span>
          <RowItem label='Gas Limit'>
            <Input
              defaultValue={`${config?.networks[type].gasLimit}`}
              key={index}
              onChange={(e) => {
                networks[type].gasLimit = `${e.target.value}`;
                setNetworks(Object.assign({}, config?.networks));
              }}
            />
          </RowItem>
          <RowItemAddition
            buttonTxt='Add Accounts'
            data={networks[type].accounts || []}
            handleChange={(data) => {
              networks[type].accounts = data;
              setNetworks(Object.assign({}, config?.networks));
            }}
            label='Accounts'
          />
          <RowItem label='EndPoint'>
            <Input
              defaultValue={`${config?.networks[type].endpoint}`}
              key={index}
              onChange={(e) => {
                if (networks[type]) {
                  networks[type].endpoint = `${e.target.value}`;
                }

                setNetworks(Object.assign({}, config?.networks));
              }}
            />
          </RowItem>
        </div>
      ))}
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
  ) : null;
};

export default React.memo(Run);
