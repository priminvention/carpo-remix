import type { Handle } from '@carpo-remix/common/webview/handle';
import type { CompilerContext } from './ctx';

import { AbstractViewProvider } from '@carpo-remix/common';
import * as vscode from 'vscode';

export default class CompilerWebviewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpoCompiler.compileView';

  private ctx: CompilerContext;

  constructor(_extensionUri: vscode.Uri, ctx: CompilerContext) {
    super(_extensionUri, 'build/view', (id, type, request) => this.handle(id, type, request));
    this.ctx = ctx;
  }

  private handle: Handle = (id, type, request) => {
    switch (type) {
      case 'carpo-compiler.compile':
        return this.ctx.commands.execCommand('carpo-compiler.compile', request as string[]);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };
}
