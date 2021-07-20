// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
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

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('extension.helloWorld', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    vscode.window.showInformationMessage('Hello World from helloworld!');
  });

  context.subscriptions.push(disposable, output, statusBar);

  init(workspace, statusBar).catch(output.appendLine);
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
