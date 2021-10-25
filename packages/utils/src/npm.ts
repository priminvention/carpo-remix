import { execSync } from 'child_process';
import { spawn } from 'cross-spawn';

import { processPromise } from './process';

export function shouldUseYarn(): boolean {
  try {
    execSync('yarn --version', { stdio: 'ignore' });

    return true;
  } catch (e) {
    return false;
  }
}

export function doYarn(cwd: string, output?: (msg: string) => void): Promise<void> {
  process.chdir(cwd);

  return processPromise(spawn(`yarn`, ['install']), output);
}

export function doNpm(cwd: string, output?: (msg: string) => void): Promise<void> {
  process.chdir(cwd);

  return processPromise(spawn('npm', ['install']), output);
}

export function doYarnAdd(cwd: string, pkg: string, version?: string, output?: (msg: string) => void): Promise<void> {
  process.chdir(cwd);

  return processPromise(spawn('yarn', ['add', `${pkg}${version ? '@' + version : ''}`]), output);
}

export function doNpmInstall(
  cwd: string,
  pkg: string,
  version?: string,
  output?: (msg: string) => void
): Promise<void> {
  process.chdir(cwd);

  return processPromise(spawn('npm', ['install', `${pkg}${version ? '@' + version : ''}`]), output);
}
