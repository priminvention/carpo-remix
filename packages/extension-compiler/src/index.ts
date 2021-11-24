// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { registerCommand, SourceManager } from '@carpo-remix/common';
import * as vscode from 'vscode';

import CompilerWebviewProvider from './CompilerWebviewProvider';
import { CompilerContext } from './ctx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const sourceManager = new SourceManager();
  const ctx = new CompilerContext(sourceManager);

  console.log('"carpo-compiler" is now active!');
  const webviewProvider = new CompilerWebviewProvider(context.extensionUri);

  context.subscriptions.push(
    ctx,
    vscode.window.registerWebviewViewProvider(CompilerWebviewProvider.viewType, webviewProvider),
    registerCommand('carpo-compiler.compile', ctx.compile.bind(ctx)),
    registerCommand('carpo-compiler.compileOne', ctx.compileOne.bind(ctx))
  );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
