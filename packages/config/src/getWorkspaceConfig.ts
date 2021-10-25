import type { ProjectConfig } from './types';

import fs from 'fs-extra';
import path from 'path';

import { defaultConfigName } from '.';

export function getWorkspaceConfig(workspacePath: string): ProjectConfig;
export function getWorkspaceConfig(workspacePath?: null): null;

export function getWorkspaceConfig(workspacePath?: string | null): ProjectConfig | null {
  if (workspacePath) {
    return fs.readJSONSync(path.resolve(workspacePath, defaultConfigName));
  }

  return null;
}
