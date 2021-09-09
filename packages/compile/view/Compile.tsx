import { sendMessage } from '@carpo/common/sendMessage';
import { Artifacts, RowItem, RowItemAddition, useRedspot } from '@carpo/react-components';
import { Button, Divider, Select, Switch } from 'antd';
import React, { useEffect, useState } from 'react';
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
      <RowItemAddition
        buttonTxt='Add source'
        data={sources}
        handleChange={(data) => setSources(data)}
        label='Sources'
      />
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
