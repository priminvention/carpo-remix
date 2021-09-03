import { sendMessage } from '@carpo/common/sendMessage';
import React, { useEffect } from 'react';

const Compile: React.FC = () => {
  useEffect(() => {
    sendMessage('redspot.getConfig', null).then(console.log).catch(console.error);
  }, []);

  return <>Compile</>;
};

export default React.memo(Compile);
