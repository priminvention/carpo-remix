import type { SoliditySettings } from '@carpo-remix/helper/types';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { WorkspaceConfig } from '@carpo-remix/config/types';
import { Artifacts, SoliditySetting, SolidityVersion } from '@carpo-remix/react-components';
import { Button, Checkbox, Form, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';

const Root: React.FC = () => {
  const [version, setVersion] = useState<string>();
  const [contracts, setContracts] = useState<string[]>([]);
  const [selectedContract, setSelectedContract] = useState<string[]>([]);
  const [autoCompile, setAutoCompile] = useState<boolean>();
  const [config, setConfig] = useState<WorkspaceConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [soliditySetting, setSoliditySetting] = useState<SoliditySettings>();

  useEffect(() => {
    sendMessage('contracts.files', null).then(setContracts).catch(console.error);
    sendMessage('workspace.config', null)
      .then((config) => {
        setConfig(config);
        setSoliditySetting(config?.solidity?.settings);
        setVersion(config?.solidity?.version);
        setAutoCompile(config?.autoCompile ?? false);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    setConfig((config) => ({
      ...config,
      solidity: {
        version,
        settings: soliditySetting
      }
    }));
  }, [version, soliditySetting]);

  const compile = useCallback((filenames: string[]) => {
    setLoading(true);

    return sendMessage('carpo-compiler.compile', filenames)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Form>
        <Form.Item label='Compiler Version'>
          <SolidityVersion
            onChange={(version) => sendMessage('workspace.setConfig', { solidity: { version } }).catch(console.error)}
            onSelect={setVersion}
            value={version}
          />
        </Form.Item>
        <Form.Item label='Auto Compile'>
          <Checkbox
            checked={autoCompile ?? false}
            onChange={(e) => {
              sendMessage('workspace.setConfig', {
                autoCompile: e.target.checked
              }).catch(console.error);
              setAutoCompile(e.target.checked);
            }}
          >
            Auto Compile
          </Checkbox>
        </Form.Item>
        <Form.Item label='Settings'>
          <SoliditySetting
            onChange={setSoliditySetting}
            onSave={() => {
              sendMessage('workspace.setConfig', { solidity: { settings: soliditySetting } }).catch(console.error);
            }}
            value={soliditySetting}
          />
        </Form.Item>
        <Form.Item label='Select File'>
          <Select
            allowClear
            mode='multiple'
            onChange={setSelectedContract}
            placeholder='Compile all'
            value={selectedContract}
          >
            {contracts.map((contract) => (
              <Select.Option key={contract} value={contract}>
                {contract}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Button
            loading={loading}
            onClick={() => compile(selectedContract.length === 0 ? contracts : selectedContract)}
            type='primary'
          >
            Compile {selectedContract.length === 0 ? 'All' : 'Selected'}
          </Button>
        </Form.Item>
      </Form>
      <Artifacts />
    </>
  );
};

export default Root;
