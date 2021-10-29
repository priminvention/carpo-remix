import type { Disposed } from '@carpo-remix/common/types';
import type { ProjectConfig } from '@carpo-remix/config/types';

import { createWebviewPanel } from '@carpo-remix/common';
import { Handle } from '@carpo-remix/common/webview/handle';
import { defaultConfigName } from '@carpo-remix/config';
import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { npm, toast } from '@carpo-remix/utils';
import * as vscode from 'vscode';

import { Base } from './base';

export class CoreContext extends Base implements Disposed {
  public static viewType = 'carpo-core.createProjectView';
  public static viewName = 'Create Project';

  #watchers: vscode.FileSystemWatcher[] = [];

  constructor(ctx: vscode.ExtensionContext) {
    super(ctx);
    this.emit('ready', this);
    this.commands.registerCommand('carpo-core.createProject', () => this.createWebviewPanel());
    this.watchProjectConfig();
  }

  private createWebviewPanel() {
    createWebviewPanel(
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
        return this.commands.execCommand('carpo-core.genConfig', request as ProjectConfig);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };

  private watchProjectConfig(): void {
    if (this.workspace) {
      const watcher = vscode.workspace.createFileSystemWatcher(
        {
          base: this.workspace,
          pattern: defaultConfigName
        },
        false,
        false,
        false
      );

      watcher.onDidCreate(() =>
        this.installDeps()
          .then(this.installSolc.bind(this))
          .catch((error: Error) => {
            toast.error(error.message);
          })
          .finally(() => (this.statusBar.text = 'Carpo'))
      );
      watcher.onDidChange(() =>
        this.installDeps()
          .then(this.installSolc.bind(this))
          .catch((error: Error) => {
            toast.error(error.message);
          })
          .finally(() => (this.statusBar.text = 'Carpo'))
      );

      this.#watchers.push(watcher);
    }
  }

  private async installDeps(): Promise<void> {
    if (!this.workspace) {
      return Promise.reject(new Error('No workspace'));
    }

    this.statusBar.text = 'Carpo: install deps';
    const installFunc = npm.shouldUseYarn() ? npm.doYarn : npm.doNpm;

    await installFunc();
  }

  private async installSolc(): Promise<void> {
    if (!this.workspace) {
      return Promise.reject(new Error('No workspace'));
    }

    const config = getWorkspaceConfig(this.workspace);
    const solcVersion = config?.solidity?.version;
    const solcText = `solc${solcVersion ? '@' + solcVersion : ''}`;

    this.statusBar.text = `Carpo: install ${solcText}`;
    const installFunc = npm.shouldUseYarn() ? npm.doYarnAdd : npm.doNpmInstall;

    await installFunc('solc', solcVersion);
  }

  public dispose(): any {
    super.dispose();
    this.#watchers.forEach((watcher) => watcher.dispose());
  }
}
