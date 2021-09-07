import { RedspotProvider } from '@carpo/react-components';
import React from 'react';

import Run from './Run';

const Root: React.FC = () => {
  return (
    <RedspotProvider>
      <Run />
    </RedspotProvider>
  );
};

export default Root;
