import { carpoConfigBase, redspotConfigPath, userSettingPath } from '@carpo/config';
import { redspotConfigTemplate } from '@carpo/config/redspotConfig';
import fs from 'fs-extra';

import { Redspot } from './redspot';
import { doNpm, doYarn, shouldUseYarn } from './utils';

export class CarpoContext extends Redspot {
  #isReady: Promise<CarpoContext>;

  constructor(_basePath: string) {
    super(_basePath);
    this.#isReady = this.doInstall()
      .then(() => {
        this.emit('installed', null);
        this.statusBar.text = 'Installed';
      })
      .then(() => this.genConfig())
      .then(() => {
        this.emit('ready', this);

        this.statusBar.text = 'Carpo: Ready';

        return this;
      });
  }

  public get isReady(): Promise<CarpoContext> {
    return this.#isReady;
  }

  private async genConfig(): Promise<void> {
    const config = await this.redspotConfig;

    fs.ensureDirSync(carpoConfigBase(this.basePath));
    fs.ensureFileSync(redspotConfigPath(this.basePath));
    fs.writeFileSync(redspotConfigPath(this.basePath), redspotConfigTemplate(this.basePath));
    fs.writeJsonSync(userSettingPath(this.basePath), config, { spaces: 2 });
  }

  private async doInstall(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
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
    await this.checkRedspotVersion();
  }
}
