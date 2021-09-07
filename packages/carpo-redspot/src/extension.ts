// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { CompileViewProvider } from '@carpo/compile/CompileViewProvider';
import { RunViewProvider } from '@carpo/run/RunViewProvider';
import * as vscode from 'vscode';

import { CarpoContext } from './ctx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): void {
  if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length !== 1) {
    return;
  }

  const ctx = vscode.workspace.workspaceFolders.map(({ uri }) => {
    return new CarpoContext(uri.path);
  })[0];

  // This line of code will only be executed once when your extension is activated // Use the console to output diagnostic information (console.log) and errors (console.error)
  console.log('Congratulations, your extension "extension" is now active!');

  const compileProvider = new CompileViewProvider(context.extensionUri, 'dist/compile', ctx);
  const runProvider = new RunViewProvider(context.extensionUri, 'dist/run', ctx);

  context.subscriptions.push(
    ctx,
    vscode.window.registerWebviewViewProvider(CompileViewProvider.viewType, compileProvider),
    vscode.window.registerWebviewViewProvider(RunViewProvider.viewType, runProvider)
  );
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
