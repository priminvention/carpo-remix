// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ethers } from 'ethers';
import * as vscode from 'vscode';

import { DeployContext } from './ctx';
import DeployWebviewProvider from './DeployWebviewProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const ctx = new DeployContext();

  console.log('"carpo-deploy" is now active!');

  const webviewProvider = new DeployWebviewProvider(context.extensionUri, ctx);

  context.subscriptions.push(
    ctx,
    vscode.window.registerWebviewViewProvider(DeployWebviewProvider.viewType, webviewProvider)
  );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
