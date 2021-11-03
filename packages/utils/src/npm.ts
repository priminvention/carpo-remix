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

export function doYarnAdd(deps: { pkg: string; version?: string }[], dev = true): Promise<TaskExecution> {
  const pkgStr = deps.map(({ pkg, version }) => `${pkg}${version ? '@' + version : ''}`).join(' ');
  const task = new NpmTask(`Carpo: yarn add ${pkgStr}`, `yarn add ${dev ? '-D' : ''} ${pkgStr}`);

  return task.execute();
}

export function doNpmInstall(deps: { pkg: string; version?: string }[], dev = true): Promise<TaskExecution> {
  const pkgStr = deps.map(({ pkg, version }) => `${pkg}${version ? '@' + version : ''}`).join(' ');
  const task = new NpmTask(`Carpo: npm install ${pkgStr}`, `npm install ${dev ? '--save-dev' : '--save'} ${pkgStr}`);

  return task.execute();
}
