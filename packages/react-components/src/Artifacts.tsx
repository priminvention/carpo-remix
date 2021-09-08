import { sendMessage } from '@carpo/common/sendMessage';
import { Typography } from 'antd';
import React, { useEffect, useState } from 'react';

const { Text } = Typography;

const Artifacts: React.FC = () => {
  const [artifacts, setArtifacts] = useState<any[]>([]);

  useEffect(() => {
    sendMessage('redspot.subArtifacts', null, setArtifacts).then(setArtifacts).catch(console.error);
  }, []);

  return (
    <>
      Artifacts:{' '}
      {artifacts.map((artifact, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {artifact?.contract?.name}@{artifact?.contract?.version} By{' '}
          {(artifact?.contract?.authors as string[]).join(',')}
          <Text copyable={{ text: JSON.stringify(artifact || {}, null, 2) }}>Copy metadata</Text>
        </div>
      ))}
    </>
  );
};

export default React.memo(Artifacts);
