import type { Handle } from '@carpo-remix/common/webview/handle';

import { AbstractViewProvider, execCommand } from '@carpo-remix/common';
import * as vscode from 'vscode';

export default class CompilerWebviewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpoCompiler.compileView';

  constructor(_extensionUri: vscode.Uri) {
    super(_extensionUri, 'build/view', (id, type, request) => this.handle(id, type, request));
  }

  private handle: Handle = (id, type, request) => {
    switch (type) {
      case 'carpo-compiler.compile':
        return execCommand('carpo-compiler.compile', request as string[]);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };
}
