// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { registerCommand } from '@carpo-remix/common';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import * as vscode from 'vscode';

import { FlattenerContext } from './ctx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  const workspacePath = getWorkspacePath();
  const ctx = new FlattenerContext(workspacePath);

  console.log('"carpo-flattener" is now active!');

  context.subscriptions.push(ctx, registerCommand('carpo-flattener.flatten', ctx.flatten.bind(ctx)));
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
