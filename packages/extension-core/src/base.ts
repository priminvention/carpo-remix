import type { CommandKeys, CommandSignatures } from '@carpo-remix/common/commands/types';
import type { OutputChannel, QuickPickItem, StatusBarItem } from 'vscode';
import type { InterfaceEvents } from './types';

import { execCommand } from '@carpo-remix/common';
import { Disposed } from '@carpo-remix/common/types';
import { Events } from '@carpo-remix/helper/events';
import * as vscode from 'vscode';

interface CommandQuickPickItem extends QuickPickItem {
  command: CommandKeys;
  arg?: CommandSignatures[CommandKeys][0];
}

export class Base extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  protected quickPick: vscode.QuickPick<CommandQuickPickItem>;
  protected outputChannel: OutputChannel;
  protected statusBar: StatusBarItem;
  public ctx: vscode.ExtensionContext;
  public workspace: string;

  constructor(ctx: vscode.ExtensionContext, workspacePath: string) {
    super();
    this.ctx = ctx;
    this.workspace = workspacePath;

    this.quickPick = vscode.window.createQuickPick();

    this.outputChannel = vscode.window.createOutputChannel('Carpo');
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.init();
  }

  private init(): void {
    this.outputChannel.show();
    this.statusBar.text = 'Carpo';
    this.statusBar.command = 'carpo-core.openQuickPick';
    this.statusBar.show();

    this.quickPick.onDidChangeSelection((items) => {
      execCommand(items[0].command, items[0].arg).catch(console.error);
      this.quickPick.hide();
    });
  }

  public openQuickPick(): void {
    this.quickPick.items = [
      {
        label: 'Create Project',
        command: 'carpo-core.createProject'
      },
      {
        label: 'Run dev node',
        command: 'carpo-core.runDevNode'
      },
      {
        label: 'Test all',
        command: 'carpo-core.runTest'
      }
    ];
    this.quickPick.show();
  }

  public dispose(): void {
    this.quickPick.dispose();
    this.outputChannel.dispose();
    this.statusBar.dispose();
  }

  public print(value: string | Buffer | { toString: () => string }): void {
    this.outputChannel.append(value.toString());
  }

  public println(value: string | Buffer | { toString: () => string }): void {
    this.outputChannel.appendLine(value.toString());
  }

  public showOutput(preserveFocus?: boolean): void {
    this.outputChannel.show(preserveFocus);
  }

  public hideOutput(): void {
    this.outputChannel.hide();
  }

  public runCli(command: string): Promise<vscode.TaskExecution> {
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
