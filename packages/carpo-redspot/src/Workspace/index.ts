import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { OutputChannel, StatusBarItem } from 'vscode';

import { execSync } from 'child_process';
import { spawn } from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';

import { VscodeBase } from './VscodeBase';

function shouldUseYarn(): boolean {
  try {
    execSync('yarnpkg --version', { stdio: 'ignore' });

    return true;
  } catch (e) {
    return false;
  }
}

function doYarn(cwd: string): ChildProcessWithoutNullStreams {
  return spawn(`yarnpkg`, ['install', '--cwd', cwd]);
}

function doNpm(cwd: string): ChildProcessWithoutNullStreams {
  process.chdir(cwd);

  return spawn('npm', ['install']);
}

export class Workspace extends VscodeBase {
  public path: string;

  constructor(path: string, output: OutputChannel, status: StatusBarItem) {
    super(output, status);
    this.path = path;
  }

  public get isRedspotProject(): boolean {
    return (
      fs.existsSync(path.join(this.path, 'package.json')) && fs.existsSync(path.join(this.path, 'redspot.config.ts'))
    );
  }

  public get redspotVersion(): string {
    return execSync(`${path.join(this.path, 'node_modules/.bin/redspot')} --version`).toString();
  }

  public doInstall(): Promise<void> {
    return new Promise((resolve, reject) => {
      const installFunc = shouldUseYarn() ? doYarn : doNpm;
      const child = installFunc(this.path);

      child.stdout.on('data', (data) => {
        this.println(data);
      });

      child.stderr.on('data', (data) => {
        this.println(data);
      });

      child.on('close', (code) => {
        this.println(`child process exit code: ${code}`);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`child process exit code: ${code}`));
        }
      });
    });
  }
}
