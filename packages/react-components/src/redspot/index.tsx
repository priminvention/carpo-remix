import type { RedspotConfig } from 'redspot/types/config';

import { sendMessage } from '@carpo/common/sendMessage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { RedspotState } from './types';

const RedspotContext = createContext<RedspotState>({} as any);

export const RedspotProvider: React.FC = ({ children }) => {
  const [config, setConfig] = useState<RedspotConfig>();
  const [workspacePath, setWorkspacePath] = useState<string | undefined>();

  useEffect(() => {
    sendMessage('workspace.path', null).then(setWorkspacePath).catch(console.error);
  }, []);

  useEffect(() => {
    sendMessage('redspot.getConfig', null)
      .then((config) => {
        setConfig(config);
      })
      .catch(console.error);
  }, []);

  const changeConfig = useCallback((_config: RedspotConfig): Promise<RedspotConfig> => {
    return sendMessage('redspot.setConfig', _config).then((config) => {
      setConfig(config);

      return config;
    });
  }, []);

  useEffect(() => {
    sendMessage('redspot.subConfig', null, (redspotConfig) => {
      setConfig(redspotConfig);
    }).catch(console.error);
  }, []);

  return <RedspotContext.Provider value={{ config, workspacePath, changeConfig }}>{children}</RedspotContext.Provider>;
};

export const useRedspot = (): RedspotState => {
  return useContext(RedspotContext);
};
