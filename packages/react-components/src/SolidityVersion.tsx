import type { SelectProps } from 'antd';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { Select } from 'antd';
import React, { useEffect, useState } from 'react';

type Props = SelectProps<string>;

const SolidityVersion: React.FC<Props> = (props) => {
  const [releases, setReleases] = useState<Record<string, string>>({});

  useEffect(() => {
    sendMessage('solidity.releases', null).then(setReleases).catch(console.error);
  }, []);

  return (
    <Select {...props}>
      {Object.keys(releases).map((release) => (
        <Select.Option key={release} value={release}>
          {release}
        </Select.Option>
      ))}
    </Select>
  );
};

export default React.memo(SolidityVersion);
