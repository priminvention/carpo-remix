import type { Artifact } from '@carpo-remix/helper/types';

import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { useEffect, useState } from 'react';

const useArtifacts = (): Artifact[] | undefined => {
  const [artifacts, setArtifacts] = useState<Artifact[]>();

  useEffect(() => {
    sendMessage('artifacts.all', null).then(setArtifacts).catch(console.error);
  }, []);

  return artifacts;
};

export default useArtifacts;
