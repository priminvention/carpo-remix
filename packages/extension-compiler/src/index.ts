// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import CompilerWebviewProvider from './CompilerWebviewProvider';
import { CompilerContext } from './ctx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const ctx = new CompilerContext();

  console.log('"carpo-compiler" is now active!');
  const webviewProvider = new CompilerWebviewProvider(context.extensionUri, ctx);

  context.subscriptions.push(
    ctx,
    vscode.window.registerWebviewViewProvider(CompilerWebviewProvider.viewType, webviewProvider)
  );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
