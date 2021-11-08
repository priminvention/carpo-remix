import type { SoliditySettings } from 'solc';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { WorkspaceConfig } from '@carpo-remix/config/types';
import { Artifacts, SoliditySetting, SolidityVersion } from '@carpo-remix/react-components';
import { Form, Select } from 'antd';
import { VsButton, VsDropdown, VsOption } from '@carpo-remix/react-components/VscodeBaseComponents';
import React, { useCallback, useEffect, useState, ChangeEvent } from 'react';

const Root: React.FC = () => {
  const [version, setVersion] = useState<string>();
  const [contracts, setContracts] = useState<string[]>(['1', '2']);
  const [selectedContract, setSelectedContract] = useState<string[]>([]);
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
            onInput={(e: ChangeEvent<HTMLInputElement>) => {
              const version = e.target.value;
              sendMessage('workspace.setConfig', { solidity: { version } }).catch(console.error);
            }}
            onSelect={setVersion}
            value={version}
          />
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
          {/* <VsDropdown
            multiple={true}
            onInput={(e: ChangeEvent<HTMLSelectElement>) => {
              console.log(e.target.value);

              // setSelectedContract([e.target.value]);
            }}
            name='Compile all'
            value={selectedContract}
          >
            {contracts.map((contract, index) => (
              <VsOption key={index}>{contract}</VsOption>
            ))}
          </VsDropdown> */}
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
          <VsButton
            onClick={() => compile(selectedContract.length === 0 ? contracts : selectedContract)}
            type='primary'
          >
            Compile {selectedContract.length === 0 ? 'All' : 'Selected'}
            {loading && <span slot='start' className='codicon codicon-loading'></span>}
          </VsButton>
        </Form.Item>
      </Form>
      <Artifacts />
    </>
  );
};

export default Root;
