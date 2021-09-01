// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { CompileViewProvider } from '@carpo/compile/CompileViewProvider';
import * as vscode from 'vscode';

import { init } from './init';
import { Workspace } from './Workspace';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length !== 1) {
    return;
  }

  // Create output channel
  const output = vscode.window.createOutputChannel('Carpo Redspot');

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

  const workspace = vscode.workspace.workspaceFolders.map(({ uri }) => {
    return new Workspace(uri.path, output, statusBar);
  })[0];

  // This line of code will only be executed once when your extension is activated // Use the console to output diagnostic information (console.log) and errors (console.error)
  console.log('Congratulations, your extension "extension" is now active!');

  const provider = new CompileViewProvider(context.extensionUri, 'dist/compile.js');

  context.subscriptions.push(
    output,
    statusBar,
    vscode.window.registerWebviewViewProvider(CompileViewProvider.viewType, provider)
  );

  init(workspace, statusBar).catch(output.appendLine);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
