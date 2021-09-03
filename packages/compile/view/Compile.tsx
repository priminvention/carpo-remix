import { useRedspot } from '@carpo/react-components';
import React from 'react';

const Compile: React.FC = () => {
  const { config } = useRedspot();

  console.log(config);

  return <>Compile</>;
};

export default React.memo(Compile);
