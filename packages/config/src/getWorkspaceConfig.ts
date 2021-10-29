import type { ProjectConfig } from './types';

import fs from 'fs-extra';
import path from 'path';

import { defaultConfigName } from '.';

export function getWorkspaceConfig(workspacePath: string): ProjectConfig | null {
  if (fs.existsSync(path.resolve(workspacePath, defaultConfigName))) {
    return fs.readJSONSync(path.resolve(workspacePath, defaultConfigName));
  }

  return null;
}
