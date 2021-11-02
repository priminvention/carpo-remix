import type { OutputChannel, QuickPickItem, StatusBarItem } from 'vscode';
import type { InterfaceEvents } from './types';

import { Events } from '@carpo-remix/common/events';
import { Disposed } from '@carpo-remix/common/types';
import { defaultConfigName } from '@carpo-remix/config';
import { ProjectConfig } from '@carpo-remix/config/types';
import { getWorkspacePath, NoWorkspaceError } from '@carpo-remix/utils/workspace';
import fs from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';

import { CoreCommands, CoreCommandSignatures } from './commands';

interface CommandQuickPickItem extends QuickPickItem {
  command: keyof CoreCommandSignatures;
  arg?: CoreCommandSignatures[keyof CoreCommandSignatures][0];
}

export class Base extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  protected commands: CoreCommands;
  protected quickPick: vscode.QuickPick<CommandQuickPickItem>;
  protected outputChannel: OutputChannel;
  protected statusBar: StatusBarItem;
  public ctx: vscode.ExtensionContext;
  public workspace: string | null;

  constructor(ctx: vscode.ExtensionContext) {
    super();
    this.ctx = ctx;
    this.workspace = getWorkspacePath();

    this.quickPick = vscode.window.createQuickPick();
    this.commands = new CoreCommands();

    this.outputChannel = vscode.window.createOutputChannel('Carpo');
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.init();
  }

  private init(): void {
    this.outputChannel.show();
    this.statusBar.text = 'Carpo';
    this.statusBar.command = 'carpo-core.openQuickPick';
    this.statusBar.show();

    this.commands.registerCommand('carpo-core.openQuickPick', () => {
      this.quickPick.items = [
        {
          label: 'Create Project',
          command: 'carpo-core.createProject'
        }
      ];
      this.quickPick.show();
    });
    this.commands.registerCommand('carpo-core.genConfig', (arg: ProjectConfig) => {
      if (!this.workspace) throw new NoWorkspaceError();
      this.println('Generate carpo.json');
      this.println(JSON.stringify(arg));

      fs.writeJsonSync(path.resolve(this.workspace, defaultConfigName), arg, {
        spaces: 2
      });
      this.println('Done.');

      return arg;
    });

    this.quickPick.onDidChangeSelection((items) => {
      this.commands.execCommand(items[0].command, items[0].arg).catch(console.error);
      this.quickPick.hide();
    });
  }

  public dispose(): void {
    this.commands.dispose();
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
