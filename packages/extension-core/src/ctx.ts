import type { Disposed } from '@carpo-remix/common/types';

import { createWebviewPanel } from '@carpo-remix/common';
import { registerCommand } from '@carpo-remix/common/commands';
import * as vscode from 'vscode';

import { Base } from './base';

export class CoreContext extends Base implements Disposed {
  public static viewType = 'carpo-core.createProject';
  public static viewName = 'Create Project';

  #commands: vscode.Disposable[];

  constructor(ctx: vscode.ExtensionContext) {
    super(ctx);
    this.emit('ready', this);
    this.#commands = [registerCommand('carpo-core.createProject', this.createWebviewPanel)];
  }

  private createWebviewPanel() {
    createWebviewPanel(
      CoreContext.viewType,
      CoreContext.viewName,
      vscode.ViewColumn.One,
      this.ctx.extensionUri,
      'dist/main'
    );
  }

  public dispose(): any {
    super.dispose();
    this.#commands.forEach((command) => command.dispose());
  }
}
