import { RedspotProvider } from '@carpo/react-components';
import React from 'react';

import Test from './Test';

const Root: React.FC = () => {
  return (
    <RedspotProvider>
      <Test />
    </RedspotProvider>
  );
};

export default Root;
