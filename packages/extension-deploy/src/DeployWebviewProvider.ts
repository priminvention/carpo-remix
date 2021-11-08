import type { Handle } from '@carpo-remix/common/webview/handle';

import { AbstractViewProvider } from '@carpo-remix/common';
import * as vscode from 'vscode';

export default class DeployWebviewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpoDeploy.deployView';

  constructor(_extensionUri: vscode.Uri) {
    super(_extensionUri, 'build/view', (id, type, request) => this.handle(id, type, request));
  }

  private handle: Handle = (id, type, request) => {
    switch (type) {
      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };
}
