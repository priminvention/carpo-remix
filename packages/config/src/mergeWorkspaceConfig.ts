import fs from 'fs-extra';
import { merge } from 'lodash';
import path from 'path';

import { WorkspaceConfig } from './types';
import { defaultConfigName } from '.';

export function mergeWorkspaceConfig(
  workspacePath: string,
  config: WorkspaceConfig,
  source: WorkspaceConfig
): WorkspaceConfig {
  const newConfig = merge(config, source);

  fs.writeJsonSync(path.resolve(workspacePath, defaultConfigName), newConfig, {
    spaces: 2
  });

  return newConfig;
}
