import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { VsDropdown, VsOption } from './VscodeBaseComponents';
import React, { useEffect, useState } from 'react';

const SolidityVersion: React.FC<any> = (props) => {
  const [releases, setReleases] = useState<Record<string, string>>({});

  useEffect(() => {
    sendMessage('solidity.releases', null).then(setReleases).catch(console.error);
  }, []);

  return (
    <VsDropdown {...props}>
      {Object.keys(releases).map((release) => (
        <VsOption key={release} value={release}>
          {release}
        </VsOption>
      ))}
    </VsDropdown>
  );
};

export default React.memo(SolidityVersion);
