import { RedspotProvider } from '@carpo/react-components';
import React from 'react';

import Compile from './Compile';

const Root: React.FC = () => {
  return (
    <RedspotProvider>
      <Compile />
    </RedspotProvider>
  );
};

export default Root;
