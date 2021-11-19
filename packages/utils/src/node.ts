import type { TaskExecution } from 'vscode';

import { DevNodeTask } from '@carpo-remix/common';
import fs from 'fs-extra';
import path from 'path';

import { doNpmInstall, doYarnAdd, shouldUseYarn } from './npm';

export async function runDevNode(workspacePath: string): Promise<TaskExecution> {
  if (!checkGanache(workspacePath)) {
    await installGanache();
  }
  console.log('runDevNode processing !');

  const devNodeTask = new DevNodeTask();

  return devNodeTask.execute();
}

export function checkGanache(workspacePath: string): boolean {
  return fs.existsSync(path.resolve(workspacePath, 'node_modules', '.bin', 'ganache-cli'));
}

export async function installGanache(): Promise<void> {
  const addFunc = shouldUseYarn() ? doYarnAdd : doNpmInstall;

  await addFunc([
    {
      pkg: 'ganache'
    },
    {
      pkg: 'ganache-cli'
    }
  ]);
}
