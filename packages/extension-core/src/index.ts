// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import type { CoreApi } from '@carpo-remix/common/getCoreApi';

import { execCommand, registerCommand, setContext, TestManager } from '@carpo-remix/common';
import { ConfigManager } from '@carpo-remix/common/ConfigManager';
import * as vscode from 'vscode';

import { CoreContext } from './ctx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): CoreApi {
  const configManager = new ConfigManager();
  const testManager = new TestManager();
  const ctx = new CoreContext(context, configManager);

  console.log('"carpo-core" is now active!');

  vscode.window.onDidChangeActiveTextEditor(async (e) => {
    if (e && (await testManager.getFiles()).includes(e.document.uri.path)) {
      setContext('carpo-core.testViewOpen', true).catch(console.error);
    } else {
      setContext('carpo-core.testViewOpen', false).catch(console.error);
    }
  });

  context.subscriptions.push(
    ctx,
    registerCommand('carpo-core.openQuickPick', () => Promise.resolve(ctx.openQuickPick())),
    registerCommand('carpo-core.genConfig', (arg) => Promise.resolve(ctx.genConfig(arg))),
    registerCommand('carpo-core.runDevNode', ctx.runDevNode.bind(ctx)),
    registerCommand('carpo-core.createProject', () => Promise.resolve(ctx.createWebviewPanel())),
    registerCommand('carpo-core.runScript', ctx.runScript.bind(ctx)),
    registerCommand('carpo-core.runTest', ctx.runTest.bind(ctx)),
    registerCommand('carpo-core.runTestOne', (args) => execCommand('carpo-core.runTest', (args as vscode.Uri).path))
  );

  return { ctx, configManager, testManager };
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
