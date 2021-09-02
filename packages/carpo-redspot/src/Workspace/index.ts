import type { ChildProcessWithoutNullStreams } from 'child_process';
import type { RedspotConfig } from 'redspot/types/config';
import type { OutputChannel, StatusBarItem } from 'vscode';

import { carpoConfigBase, redspotConfigPath, userSettingPath } from '@carpo/config';
import { redspotConfigTemplate } from '@carpo/config/redspotConfig';
import { execSync } from 'child_process';
import { spawn } from 'cross-spawn';
import fs from 'fs-extra';
import path from 'path';

import { VscodeBase } from './VscodeBase';

function shouldUseYarn(): boolean {
  try {
    execSync('yarn --version', { stdio: 'ignore' });

    return true;
  } catch (e) {
    return false;
  }
}

function doYarn(cwd: string): ChildProcessWithoutNullStreams {
  process.chdir(cwd);

  return spawn(`yarn`, ['install']);
}

function doNpm(cwd: string): ChildProcessWithoutNullStreams {
  process.chdir(cwd);

  return spawn('npm', ['install']);
}

export class Workspace extends VscodeBase {
  public path: string;
  private redspotBin: string;

  constructor(_path: string, _output: OutputChannel, _status: StatusBarItem) {
    super(_output, _status);
    this.path = _path;
    this.redspotBin = path.join(_path, 'node_modules/.bin/redspot');
  }

  public get isRedspotProject(): boolean {
    return (
      fs.existsSync(path.join(this.path, 'package.json')) && fs.existsSync(path.join(this.path, 'redspot.config.ts'))
    );
  }

  public get redspotVersion(): any {
    return execSync(`node ${this.redspotBin} --version`).toString();
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

  public getRedspotConfig(): RedspotConfig {
    process.chdir(this.path);
    const execCommand = `node ${this.redspotBin} metadata`;

    const output = execSync(execCommand, { maxBuffer: 1024 * 2048 }).toString();

    const outputObj: RedspotConfig = JSON.parse(output);

    outputObj.paths = {
      ...outputObj.paths,
      configFile: redspotConfigPath(this.path)
    };

    return outputObj;
  }

  public genConfig(): void {
    const config = this.getRedspotConfig();

    fs.ensureDirSync(carpoConfigBase(this.path));
    fs.ensureFileSync(redspotConfigPath(this.path));
    fs.writeFileSync(redspotConfigPath(this.path), redspotConfigTemplate(this.path));
    fs.writeJsonSync(userSettingPath(this.path), config, { spaces: 2 });
  }
}
