import type { Disposed } from '@carpo-remix/common/types';
import type { WorkspaceConfig } from '@carpo-remix/config/types';

import { ConfigManager, createWebviewPanel, execCommand, FunctionalTask, NpmTask } from '@carpo-remix/common';
import { Handle } from '@carpo-remix/common/webview/handle';
import { defaultConfigName } from '@carpo-remix/config';
import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { node, npm, toast } from '@carpo-remix/utils';
import fs from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';

import { Base } from './base';

export class CoreContext extends Base implements Disposed {
  public static viewType = 'carpo-core.createProjectView';
  public static viewName = 'Create Project';

  #watcher: ConfigManager;
  #webviewPanel: vscode.WebviewPanel | null = null;
  #installing = false;
  #prevConfig: WorkspaceConfig | null = null;

  constructor(ctx: vscode.ExtensionContext, watcher: ConfigManager) {
    super(ctx);
    this.#watcher = watcher;
    this.emit('ready', this);

    this.#watcher.on('change', this.configChange.bind(this));
    this.#watcher.on('create', this.configChange.bind(this));
    this.#prevConfig = this.#watcher.config;
  }

  public createWebviewPanel(): void {
    this.#webviewPanel = createWebviewPanel(
      CoreContext.viewType,
      CoreContext.viewName,
      vscode.ViewColumn.One,
      this.ctx.extensionUri,
      'build/view',
      this.handle
    );
  }

  public genConfig(config: WorkspaceConfig): WorkspaceConfig {
    this.println('Generate carpo.json');
    this.println(JSON.stringify(config));

    fs.writeJsonSync(path.resolve(this.workspace, defaultConfigName), config, {
      spaces: 2
    });
    this.println('Done.');

    return config;
  }

  public async runDevNode(): Promise<void> {
    await node.runDevNode(this.workspace);
  }

  public async runFunction(name: string, func: (writeEmitter: vscode.EventEmitter<string>) => any): Promise<void> {
    const functional = new FunctionalTask(name, async (writeEmitter) => {
      await func(writeEmitter);
    });

    await functional.execute();
  }

  public async runScript(_path: string): Promise<void> {
    const task = new NpmTask('Script', `node -r ts-node/register ${path.resolve(this.workspace, _path)}`);

    await task.execute();
  }

  private handle: Handle = (id, type, request) => {
    switch (type) {
      case 'carpo-core.genConfig':
        this.#webviewPanel?.dispose();
        this.#webviewPanel = null;

        return execCommand('carpo-core.genConfig', request as WorkspaceConfig);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };

  private configChange() {
    if (this.#installing) return;

    this.#installing = true;
    this.installDeps()
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => {
        this.statusBar.text = 'Carpo';
        this.#installing = false;
      });
  }

  private async installDeps(): Promise<void> {
    const config = getWorkspaceConfig(this.workspace);
    const installFunc = npm.shouldUseYarn() ? npm.doYarn : npm.doNpm;
    const addFunc = npm.shouldUseYarn() ? npm.doYarnAdd : npm.doNpmInstall;

    this.statusBar.text = 'Carpo: install deps';

    await installFunc();

    const solcVersion = config?.solidity?.version;

    this.statusBar.text = `Carpo: install solc,ganache,ganache-cli`;

    await addFunc([
      {
        pkg: 'ts-node'
      },
      {
        pkg: '@types/node'
      },
      {
        pkg: 'typescript'
      },
      {
        pkg: 'solc',
        version: solcVersion
      },
      {
        pkg: 'ganache'
      },
      {
        pkg: 'ganache-cli'
      },
      {
        pkg: '@carpo-remix/config'
      },
      {
        pkg: '@carpo-remix/helper'
      }
    ]);
  }

  public dispose(): any {
    super.dispose();
    this.#watcher.off('create', this.configChange.bind(this));
    this.#watcher.off('change', this.configChange.bind(this));
    this.#watcher.dispose();
  }
}
