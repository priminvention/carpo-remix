// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below

import type { CoreApi } from '@carpo-remix/common/getCoreApi';

import { registerCommand } from '@carpo-remix/common';
import { ConfigManager } from '@carpo-remix/common/ConfigManager';
import * as vscode from 'vscode';

import { CoreContext } from './ctx';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext): CoreApi {
  const configManager = new ConfigManager();
  const ctx = new CoreContext(context, configManager);

  console.log('"carpo-core" is now active!');

  context.subscriptions.push(
    ctx,
    registerCommand('carpo-core.openQuickPick', () => Promise.resolve(ctx.openQuickPick())),
    registerCommand('carpo-core.genConfig', (arg) => Promise.resolve(ctx.genConfig(arg))),
    // registerCommand('carpo-core.runDevNode', () => {
    //   ctx.runDevNode.bind(ctx);
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       resolve(true);
    //     }, 3000);
    //   });
    // }),
    registerCommand('carpo-core.runDevNode', ctx.runDevNode.bind(ctx)),
    // ctx.runDevNode.bind(ctx)
    registerCommand('carpo-core.createProject', () => Promise.resolve(ctx.createWebviewPanel())),
    registerCommand('carpo-core.runScript', ctx.runScript.bind(ctx))
  );

  return { ctx, configManager };
}

// this method is called when your extension is deactivated
export function deactivate(): void {
  console.log('deactivate');
}
