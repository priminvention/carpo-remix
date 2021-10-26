import { NpmTask } from '@carpo-remix/common';
import { execSync } from 'child_process';
import { TaskExecution } from 'vscode';

export function shouldUseYarn(): boolean {
  try {
    execSync('yarn --version', { stdio: 'ignore' });

    return true;
  } catch (e) {
    return false;
  }
}

export function doYarn(): Promise<TaskExecution> {
  const task = new NpmTask('Carpo: yarn install', 'yarn install');

  return task.execute();
}

export function doNpm(): Promise<TaskExecution> {
  const task = new NpmTask('Carpo: npm install', 'npm install');

  return task.execute();
}

export function doYarnAdd(pkg: string, version?: string): Promise<TaskExecution> {
  const pkgStr = `${pkg}${version ? '@' + version : ''}`;
  const task = new NpmTask(`Carpo: yarn add ${pkgStr}`, `yarn add ${pkgStr}`);

  return task.execute();
}

export function doNpmInstall(pkg: string, version?: string): Promise<TaskExecution> {
  const pkgStr = `${pkg}${version ? '@' + version : ''}`;
  const task = new NpmTask(`Carpo: npm install ${pkgStr}`, `npm install ${pkgStr}`);

  return task.execute();
}
