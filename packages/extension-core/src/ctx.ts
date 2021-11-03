import type { Disposed } from '@carpo-remix/common/types';
import type { WorkspaceConfig } from '@carpo-remix/config/types';

import { createWebviewPanel } from '@carpo-remix/common';
import { Handle } from '@carpo-remix/common/webview/handle';
import { ConfigManager } from '@carpo-remix/config/ConfigManager';
import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { npm, toast } from '@carpo-remix/utils';
import * as vscode from 'vscode';

import { Base } from './base';

export class CoreContext extends Base implements Disposed {
  public static viewType = 'carpo-core.createProjectView';
  public static viewName = 'Create Project';

  #watcher: ConfigManager;
  #webviewPanel: vscode.WebviewPanel | null = null;

  constructor(ctx: vscode.ExtensionContext, watcher: ConfigManager) {
    super(ctx);
    this.commands.registerCommand('carpo-core.createProject', () => this.createWebviewPanel());
    this.#watcher = watcher;
    this.emit('ready', this);

    this.#watcher.on('change', this.configChange.bind(this));
    this.#watcher.on('create', this.configChange.bind(this));
  }

  private createWebviewPanel() {
    this.#webviewPanel = createWebviewPanel(
      CoreContext.viewType,
      CoreContext.viewName,
      vscode.ViewColumn.One,
      this.ctx.extensionUri,
      'build/view',
      this.handle
    );
  }

  private handle: Handle = (id, type, request) => {
    switch (type) {
      case 'carpo-core.genConfig':
        this.#webviewPanel?.dispose();
        this.#webviewPanel = null;

        return this.commands.execCommand('carpo-core.genConfig', request as WorkspaceConfig);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };

  private configChange() {
    this.installDeps()
      .catch((error: Error) => {
        toast.error(error.message);
      })
      .finally(() => (this.statusBar.text = 'Carpo'));
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
        pkg: 'solc',
        version: solcVersion
      },
      {
        pkg: 'ganache'
      },
      {
        pkg: 'ganache-cli'
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
