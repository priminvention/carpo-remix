import type { Disposed } from '@carpo-remix/common/types';
import type { ProjectConfig } from '@carpo-remix/config/types';

import { createWebviewPanel } from '@carpo-remix/common';
import { Handle } from '@carpo-remix/common/webview/handle';
import * as vscode from 'vscode';

import { Base } from './base';

export class CoreContext extends Base implements Disposed {
  public static viewType = 'carpo-core.createProjectView';
  public static viewName = 'Create Project';

  constructor(ctx: vscode.ExtensionContext) {
    super(ctx);
    this.emit('ready', this);
    this.commands.registerCommand('carpo-core.createProject', () => this.createWebviewPanel());
  }

  private createWebviewPanel() {
    createWebviewPanel(
      CoreContext.viewType,
      CoreContext.viewName,
      vscode.ViewColumn.One,
      this.ctx.extensionUri,
      'dist/main',
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

  public dispose(): any {
    super.dispose();
  }
}
