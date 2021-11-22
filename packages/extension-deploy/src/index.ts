// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { execCommand } from '@carpo-remix/common';
import { DeployContext } from './ctx';
import DeployWebviewProvider from './DeployWebviewProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const ctx = new DeployContext();

  console.log('"carpo-deploy" is now active!');
  execCommand('carpo-core.runDevNode');
  const webviewProvider = new DeployWebviewProvider(context.extensionUri);

  context.subscriptions.push(
    ctx,
    vscode.window.registerWebviewViewProvider(DeployWebviewProvider.viewType, webviewProvider)
  );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
