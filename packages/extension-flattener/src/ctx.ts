import type { Disposed } from '@carpo-remix/common/types';
import type { Uri } from 'vscode';
import type { InterfaceEvents } from './types';

import { Events } from '@carpo-remix/helper/events';
import * as vscode from 'vscode';

import flatten from './flatten';

export class FlattenerContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  private workspacePath: string;

  constructor(workspacePath: string) {
    super();

    this.workspacePath = workspacePath;

    this.emit('ready', this);
  }

  public async flatten(filename: string | Uri): Promise<string> {
    const doc = await vscode.workspace.openTextDocument({
      language: 'solidity',
      content: await flatten(typeof filename === 'string' ? filename : filename.path, this.workspacePath)
    });

    await vscode.window.showTextDocument(doc, {
      preview: true,
      preserveFocus: true,
      viewColumn: vscode.ViewColumn.Beside
    });

    return Promise.resolve('');
  }

  public dispose(): void {
    console.log('dispose');
  }
}
