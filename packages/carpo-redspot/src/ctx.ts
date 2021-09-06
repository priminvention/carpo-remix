import type { ChildProcessWithoutNullStreams } from 'child_process';

import { carpoConfigBase, redspotConfigPath, userSettingPath } from '@carpo/config';
import { redspotConfigTemplate } from '@carpo/config/redspotConfig';
import { execSync } from 'child_process';
import { spawn } from 'cross-spawn';
import fs from 'fs-extra';

import { Redspot } from './redspot';

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

export class CarpoContext extends Redspot {
  #isReady: Promise<void>;

  constructor(_basePath: string) {
    super(_basePath);
    this.#isReady = new Promise((resolve) => {
      this.emit('ready', this);
      this.genConfig();
      resolve();
    });
  }

  private genConfig(): void {
    const config = this.redspotConfig;

    fs.ensureDirSync(carpoConfigBase(this.basePath));
    fs.ensureFileSync(redspotConfigPath(this.basePath));
    fs.writeFileSync(redspotConfigPath(this.basePath), redspotConfigTemplate(this.basePath));
    fs.writeJsonSync(userSettingPath(this.basePath), config, { spaces: 2 });
  }

  public doInstall(): Promise<void> {
    return new Promise((resolve, reject) => {
      const installFunc = shouldUseYarn() ? doYarn : doNpm;
      const child = installFunc(this.basePath);

      child.stdout.on('data', (data) => {
        this.println(data);
      });

      child.stderr.on('data', (data) => {
        this.println(data);
      });

      child.on('close', (code) => {
        this.println(`Install deps success with exit code: ${code}`);

        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`child process exit code: ${code}`));
        }
      });
    });
  }
}
