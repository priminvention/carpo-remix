import type { RedspotConfig } from 'redspot/types/config';

import { redspotConfigPath, userSettingPath } from '@carpo/config';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import semver from 'semver';
import * as vscode from 'vscode';

import { Init } from './init';
import { doNpmInstall, doYarnAdd, shouldUseYarn } from './utils';

export abstract class Redspot extends Init {
  #scriptWatchers: vscode.FileSystemWatcher[];
  #scriptPaths: string[] = ['scripts'];

  #testWatchers: vscode.FileSystemWatcher[];
  #testPaths: string[] = ['tests'];

  public redspotBin: string;
  #redspotConfig: Promise<RedspotConfig>;

  constructor(_basePath: string) {
    super(_basePath);
    this.redspotBin = path.join(_basePath, 'node_modules/.bin/redspot');

    this.#scriptWatchers = this.watchScripts();
    this.#testWatchers = this.watchTests();

    this.#redspotConfig = new Promise((resolve) => {
      this.once('installed', () => {
        const userConfig = this.getUserRedspotConfig();

        resolve({
          ...userConfig,
          paths: {
            ...userConfig.paths,
            configFile: redspotConfigPath(this.basePath)
          }
        });
      });
    });
  }

  public dispose(): void {
    super.dispose();
    this.#scriptWatchers.forEach((watcher) => watcher.dispose());
  }

  public async getScriptFiles(): Promise<vscode.Uri[]> {
    const files: vscode.Uri[] = [];

    for (const scriptPath of this.#scriptPaths) {
      files.push(
        ...(await vscode.workspace.findFiles({
          base: path.resolve(this.basePath, scriptPath),
          pattern: '*.{ts,js}'
        }))
      );
    }

    return files;
  }

  public async getTestFiles(): Promise<vscode.Uri[]> {
    const files: vscode.Uri[] = [];

    for (const testPath of this.#testPaths) {
      files.push(
        ...(await vscode.workspace.findFiles({
          base: path.resolve(this.basePath, testPath),
          pattern: '*.{spec,test}.{ts,js}'
        }))
      );
    }

    return files;
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

  public get redspotConfig(): Promise<RedspotConfig> {
    return this.#redspotConfig;
  }

  public setRedspotConfig(_redspotConfig: RedspotConfig): void {
    fs.writeJsonSync(userSettingPath(this.basePath), _redspotConfig, { spaces: 2 });
    this.#redspotConfig = Promise.resolve(_redspotConfig);
    this.emit('redspot.config.change', _redspotConfig);
  }

  public compile(): Promise<vscode.TaskExecution> {
    return this.runCli(`node ${this.redspotBin} compile`);
  }

  public run(scriptPath: string): Promise<vscode.TaskExecution> {
    return this.runCli(`node ${this.redspotBin} run ${scriptPath}`);
  }

  public test(filePath?: string, noCompile = false): Promise<vscode.TaskExecution> {
    return this.runCli(`node ${this.redspotBin} test ${filePath || ''} ${noCompile ? '--no-compile' : ''}`);
  }

  public getUserRedspotConfig(): RedspotConfig {
    process.chdir(this.basePath);
    const execCommand = `node ${this.redspotBin} metadata`;

    const output = execSync(execCommand, { maxBuffer: 1024 * 2048 }).toString();

    const outputObj: RedspotConfig = JSON.parse(output);

    return outputObj;
  }

  protected checkRedspotVersion(): Promise<void> {
    const compared = semver.compare(this.redspotVersion, '0.11.9-3');

    if (compared === -1) {
      return new Promise((resolve, reject) => {
        const installFunc = shouldUseYarn() ? doYarnAdd : doNpmInstall;
        const child = installFunc(this.basePath, 'redspot', '0.11.9-3');

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

    return Promise.resolve();
  }

  private watchScripts(): vscode.FileSystemWatcher[] {
    return this.#scriptPaths.map((scriptPath) => {
      const watcher = vscode.workspace.createFileSystemWatcher(
        {
          base: path.resolve(this.basePath, scriptPath),
          pattern: '*.{ts,js}'
        },
        false,
        false,
        false
      );

      const change = () => {
        this.getScriptFiles().then((files) => {
          this.emit('redspot.script.change', files);
        }, console.error);
      };

      watcher.onDidCreate(change);
      watcher.onDidDelete(change);

      return watcher;
    });
  }

  private watchTests(): vscode.FileSystemWatcher[] {
    return this.#testPaths.map((testPath) => {
      const watcher = vscode.workspace.createFileSystemWatcher(
        {
          base: path.resolve(this.basePath, testPath),
          pattern: '*.{spec,test}.{ts,js}'
        },
        false,
        false,
        false
      );

      const change = () => {
        this.getTestFiles().then((files) => {
          this.emit('redspot.test.change', files);
        }, console.error);
      };

      watcher.onDidCreate(change);
      watcher.onDidDelete(change);

      return watcher;
    });
  }
}
