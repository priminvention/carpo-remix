import type { ChildProcessWithoutNullStreams } from 'child_process';

import { execSync } from 'child_process';
import { spawn } from 'cross-spawn';

export function shouldUseYarn(): boolean {
  try {
    execSync('yarn --version', { stdio: 'ignore' });

    return true;
  } catch (e) {
    return false;
  }
}

export function doYarn(cwd: string): ChildProcessWithoutNullStreams {
  process.chdir(cwd);

  return spawn(`yarn`, ['install']);
}

export function doNpm(cwd: string): ChildProcessWithoutNullStreams {
  process.chdir(cwd);

  return spawn('npm', ['install']);
}

export function doYarnAdd(cwd: string, pkg: string, version?: string): ChildProcessWithoutNullStreams {
  process.chdir(cwd);

  return spawn('yarn', ['add', `${pkg}${version ? '@' + version : ''}`]);
}

export function doNpmInstall(cwd: string, pkg: string, version?: string): ChildProcessWithoutNullStreams {
  process.chdir(cwd);

  return spawn('npm', ['install', `${pkg}${version ? '@' + version : ''}`]);
}
