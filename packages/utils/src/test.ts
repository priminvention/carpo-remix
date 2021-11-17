import type { TaskExecution } from 'vscode';

import { TestTask } from '@carpo-remix/common';
import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import fs from 'fs-extra';
import path from 'path';

import { doNpmInstall, doYarnAdd, installTsIfNotExist, shouldUseYarn } from './npm';

export async function runTest(workspacePath: string, _path?: string): Promise<TaskExecution> {
  if (!checkMocha(workspacePath)) {
    await installMocha();
  }

  if (!_path) {
    const config = getWorkspaceConfig(workspacePath);

    _path = path.join(config?.paths?.tests ?? 'tests', '**/*.{spec,test}.{ts,js}');
  }

  await installTsIfNotExist(workspacePath);

  const testTask = new TestTask(_path, '--require ts-node/register');

  return testTask.execute();
}

export function checkMochaConfig(workspacePath: string): boolean {
  let exist = false;

  exist = fs.existsSync(path.resolve(workspacePath, '.mocha'));

  return exist;
}

export function checkMocha(workspacePath: string): boolean {
  return (
    fs.existsSync(path.resolve(workspacePath, 'node_modules', '.bin', 'mocha')) &&
    fs.existsSync(path.resolve(workspacePath, 'node_modules', '@types/mocha'))
  );
}

export async function installMocha(): Promise<void> {
  const addFunc = shouldUseYarn() ? doYarnAdd : doNpmInstall;

  await addFunc([
    {
      pkg: 'mocha'
    },
    {
      pkg: '@types/mocha'
    }
  ]);
}
