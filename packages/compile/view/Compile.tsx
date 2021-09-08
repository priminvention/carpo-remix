import { PlusOutlined } from '@ant-design/icons';
import { sendMessage } from '@carpo/common/sendMessage';
import { Artifacts, RowItem, useRedspot } from '@carpo/react-components';
import { Button, Divider, Input, Select, Switch } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { RedspotConfig } from 'redspot/types/config';

const Compile: React.FC = () => {
  const { config } = useRedspot();

  const [docker, setDocker] = useState(config?.contract.ink.docker ?? false);
  const [version, setVersion] = useState(config?.contract.ink.version ?? '0.8.0');
  const [toolchain, setToolchain] = useState(config?.contract.ink.toolchain ?? 'nightly');
  const [sources, setSources] = useState(config?.contract.ink.sources ?? ['']);

  useEffect(() => {
    setDocker(config?.contract.ink.docker ?? false);
    setVersion(config?.contract.ink.version ?? '0.8.0');
    setToolchain(config?.contract.ink.toolchain ?? 'nightly');
    setSources(config?.contract.ink.sources ?? []);
  }, [config]);

  const changeSource = useCallback((value: string, index: number) => {
    setSources((sources) => {
      return sources.map((source, i) => (i === index ? value : source));
    });
  }, []);

  return (
    <>
      <RowItem label='Docker'>
        <Switch checked={docker} disabled onChange={setDocker} />
      </RowItem>
      <RowItem label='Ink version'>
        <Select disabled onChange={setVersion} options={[{ value: '0.8.0', text: 'v0.8.0' }]} value={version} />
      </RowItem>
      <RowItem label='Toolchain'>
        <Select
          disabled
          onChange={setToolchain}
          options={[
            { value: 'nightly', title: '+nightly' },
            { value: 'stable', title: '+stable' },
            { value: 'beta', title: '+beta' }
          ]}
          value={toolchain}
        />
      </RowItem>
      <RowItem label='Sources'>
        {sources.map((source, index) => (
          <Input
            key={index}
            onChange={(e) => {
              changeSource(e.target.value, index);
            }}
            value={source}
          />
        ))}
        <Button block icon={<PlusOutlined />} onClick={() => setSources([...sources, ''])} type='dashed'>
          Add source
        </Button>
      </RowItem>
      <Button.Group style={{ marginTop: 8, width: '100%' }}>
        <Button
          onClick={() => {
            if (!config) return;

            const newConfig: RedspotConfig = { ...config };

            newConfig.contract.ink.docker = docker;
            newConfig.contract.ink.version = version;
            newConfig.contract.ink.toolchain = toolchain;
            newConfig.contract.ink.sources = sources;

            return sendMessage('redspot.setConfig', newConfig);
          }}
          style={{ width: '100%' }}
        >
          Save
        </Button>
        <Button
          onClick={() => {
            return sendMessage('redspot.compile', null);
          }}
          style={{ width: '100%' }}
          type='primary'
        >
          Compile
        </Button>
      </Button.Group>
      <Divider style={{ marginTop: 8, marginBottom: 8 }} />
      <Artifacts />
    </>
  );
};

export default React.memo(Compile);
