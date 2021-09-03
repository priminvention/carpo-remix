import type { RedspotConfig } from 'redspot/types/config';

import { redspotConfigPath } from '@carpo/config';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

import { Init } from './init';

export abstract class Redspot extends Init {
  public redspotBin: string;
  public redspotConfig: RedspotConfig;

  constructor(_basePath: string) {
    super(_basePath);
    this.redspotBin = path.join(_basePath, 'node_modules/.bin/redspot');
    const userConfig = this.getUserRedspotConfig();

    this.redspotConfig = {
      ...userConfig,
      paths: {
        ...userConfig.paths,
        configFile: redspotConfigPath(this.basePath)
      }
    };
  }

  public get isRedspotProject(): boolean {
    return (
      fs.existsSync(path.join(this.basePath, 'package.json')) &&
      fs.existsSync(path.join(this.basePath, 'redspot.config.ts'))
    );
  }

  public get redspotVersion(): any {
    return execSync(`node ${this.redspotBin} --version`).toString();
  }

  public getUserRedspotConfig(): RedspotConfig {
    process.chdir(this.basePath);
    const execCommand = `node ${this.redspotBin} metadata`;

    const output = execSync(execCommand, { maxBuffer: 1024 * 2048 }).toString();

    const outputObj: RedspotConfig = JSON.parse(output);

    return outputObj;
  }
}
