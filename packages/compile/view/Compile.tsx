import { useRedspot } from '@carpo/react-components';
import { Button } from 'antd';
import React from 'react';

const Compile: React.FC = () => {
  const { config } = useRedspot();

  return <Button type='primary'>Compile</Button>;
};

export default React.memo(Compile);
