// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import fs from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';

import { CoreContext } from './ctx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length !== 1) {
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders.map(({ uri }) => {
    return uri.path;
  })[0];

  const ctx = new CoreContext(workspaceFolder);

  // This line of code will only be executed once when your extension is activated // Use the console to output diagnostic information (console.log) and errors (console.error)
  console.log('Congratulations, your extension "extension" is now active!');

  context.subscriptions.push(ctx);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
