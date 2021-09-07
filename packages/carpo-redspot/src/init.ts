import type { OutputChannel, StatusBarItem } from 'vscode';
import type { Disposed } from './types';

import * as vscode from 'vscode';

import { Events } from './events';

export abstract class Init extends Events implements Disposed {
  public basePath: string;
  public outputChannel: OutputChannel;
  public statusBar: StatusBarItem;

  constructor(_basePath: string) {
    super();

    this.basePath = _basePath;
    this.outputChannel = vscode.window.createOutputChannel('Carpo Redspot');
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.init();
  }

  private init(): void {
    this.outputChannel.show();
    this.statusBar.text = 'Carpo Redspot';
    this.statusBar.show();
  }

  public dispose(): void {
    this.outputChannel.dispose();
    this.statusBar.dispose();
  }

  protected print(value: string | Buffer | { toString: () => string }): void {
    this.outputChannel.append(value.toString());
  }

  protected println(value: string | Buffer | { toString: () => string }): void {
    this.outputChannel.appendLine(value.toString());
  }

  protected runCli(command: string): Promise<vscode.TaskExecution> {
    return new Promise((resolve, reject) => {
      const task = new vscode.Task(
        {
          type: command
        },
        vscode.TaskScope.Workspace,
        command,
        'npm',
        new vscode.ShellExecution(command)
      );

      vscode.tasks.executeTask(task).then((execution) => {
        vscode.tasks.onDidEndTask((e) => {
          if (e.execution === execution) {
            resolve(e.execution);
            execution.terminate();
          }
        });
      }, reject);
    });
  }
}
