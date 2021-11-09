import type { WorkspaceConfig } from './types';

import fs from 'fs-extra';
import path from 'path';

import { defaultConfigName } from './constants';

export function getWorkspaceConfig(workspacePath: string): WorkspaceConfig | null {
  if (fs.existsSync(path.resolve(workspacePath, defaultConfigName))) {
    return fs.readJSONSync(path.resolve(workspacePath, defaultConfigName));
  }

  return null;
}
