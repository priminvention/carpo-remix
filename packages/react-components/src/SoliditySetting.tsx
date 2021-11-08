import type { SoliditySettings } from 'solc';

import { Space } from 'antd';
import { VsCheckbox, VsButton, VsTextField } from './VscodeBaseComponents';
import React, { ChangeEvent } from 'react';

interface Props {
  value?: SoliditySettings;
  onChange?(value?: SoliditySettings): void;
  onSave?(): void;
}

const SoliditySetting: React.FC<Props> = ({ onChange, onSave, value }) => {
  return (
    <div style={{ display: 'flex' }}>
      <VsCheckbox
        checked={value?.optimizer?.enabled ?? false}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
      </VsCheckbox>
      <VsTextField
        disabled={!(value?.optimizer?.enabled ?? false)}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
      <VsButton onClick={onSave}>Save</VsButton>
    </div>
  );
};

export default React.memo(SoliditySetting);
