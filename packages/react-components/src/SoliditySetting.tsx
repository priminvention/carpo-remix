import type { SoliditySettings } from 'solc';

import { Button, Checkbox, Input, Space } from 'antd';
import React from 'react';

interface Props {
  value?: SoliditySettings;
  onChange?(value?: SoliditySettings): void;
  onSave?(): void;
}

const SoliditySetting: React.FC<Props> = ({ onChange, onSave, value }) => {
  return (
    <>
      <Space size='small'>
        <Checkbox
          checked={value?.optimizer?.enabled ?? false}
          onChange={(e) => {
            onChange?.({
              ...value,
              optimizer: {
                ...value?.optimizer,
                enabled: e.target.checked,
                runs: value?.optimizer?.runs ?? 200
              }
            });
          }}
        >
          Enable optimization
        </Checkbox>
        <Input
          disabled={!(value?.optimizer?.enabled ?? false)}
          onChange={(e) => {
            onChange?.({
              ...value,
              optimizer: {
                ...value?.optimizer,
                enabled: true,
                runs: parseInt(e.target.value)
              }
            });
          }}
          value={value?.optimizer?.runs ?? '200'}
        />
      </Space>
      <Button onClick={onSave} style={{ display: 'block' }}>
        Save
      </Button>
    </>
  );
};

export default React.memo(SoliditySetting);
