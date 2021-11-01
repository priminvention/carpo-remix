import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { Button } from 'antd';
import React, { useEffect } from 'react';

const Root: React.FC = () => {
  useEffect(() => {
    sendMessage('solidity.contracts', null).then(console.log).catch(console.error);
  }, []);

  return <Button type='primary'>Compiler</Button>;
};

export default Root;
