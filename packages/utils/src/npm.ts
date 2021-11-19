import type { TaskExecution } from 'vscode';

import { NpmTask } from '@carpo-remix/common';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

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

export async function installTsIfNotExist(workspacePath: string): Promise<void> {
  const addFunc = shouldUseYarn() ? doYarnAdd : doNpmInstall;

  const pkgs: { pkg: string }[] = [];

  if (!fs.existsSync(path.resolve(workspacePath, 'node_modules', 'typescript'))) pkgs.push({ pkg: 'typescript' });
  if (!fs.existsSync(path.resolve(workspacePath, 'node_modules', 'ts-node'))) pkgs.push({ pkg: 'ts-node' });
  if (!fs.existsSync(path.resolve(workspacePath, 'node_modules', '@types/node'))) pkgs.push({ pkg: '@types/node' });

  if (pkgs.length === 0) return;

  await addFunc(pkgs);
}
