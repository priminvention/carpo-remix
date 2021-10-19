import type { Disposable, OutputChannel, QuickPickItem, StatusBarItem } from 'vscode';
import type { InterfaceEvents } from './types';

import { createWebviewPanel } from '@carpo-remix/common';
import { CommandSignatures, CommandTypes, execCommand, registerCommand } from '@carpo-remix/common/commands';
import { Events } from '@carpo-remix/common/events';
import { Disposed } from '@carpo-remix/common/types';
import { defaultConfigName } from '@carpo-remix/config';
import { ProjectConfig } from '@carpo-remix/config/types';
import fs from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';

interface CommandQuickPickItem<T extends CommandTypes> extends QuickPickItem {
  command: T;
  arg?: CommandSignatures[T][0];
}

export class Base extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  public static viewType = 'carpo-core.createProject';
  public static viewName = 'Create Project';

  public outputChannel: OutputChannel;
  public statusBar: StatusBarItem;
  public ctx: vscode.ExtensionContext;
  public workspace: string | null;
  #quickPick: vscode.QuickPick<CommandQuickPickItem<CommandTypes>>;
  #commands: Disposable[];

  constructor(ctx: vscode.ExtensionContext) {
    super();
    this.ctx = ctx;
    this.workspace =
      vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
        ? vscode.workspace.workspaceFolders.map(({ uri }) => {
            return uri.path;
          })[0]
        : null;

    this.#quickPick = vscode.window.createQuickPick();
    this.#commands = [
      registerCommand('carpo-core.openQuickPick', () => {
        this.#quickPick.items = [
          {
            label: 'Create Project',
            command: 'carpo-core.createProject'
          } as CommandQuickPickItem<'carpo-core.createProject'>
        ];
        this.#quickPick.show();
      }),
      registerCommand('carpo-core.genConfig', (arg: ProjectConfig) => {
        if (!this.workspace) return;
        fs.writeJsonSync(path.resolve(this.workspace, defaultConfigName), arg, {
          spaces: 2
        });

        return arg;
      }),
      registerCommand('carpo-core.createProject', this.createWebviewPanel)
    ];

    this.outputChannel = vscode.window.createOutputChannel('Carpo');
    this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    this.init();
  }

  private init(): void {
    this.outputChannel.show();
    this.statusBar.text = 'Carpo';
    this.statusBar.command = 'carpo-core.openQuickPick';
    this.statusBar.show();

    this.#quickPick.onDidChangeSelection((items) => {
      execCommand(items[0].command, items[0].arg).catch(console.error);
      this.#quickPick.hide();
    });
  }

  private createWebviewPanel() {
    createWebviewPanel(Base.viewType, Base.viewName, vscode.ViewColumn.One, this.ctx.extensionUri, 'dist/main');
  }

  public dispose(): void {
    this.#commands.forEach((command) => command.dispose());
    this.#quickPick.dispose();
    this.outputChannel.dispose();
    this.statusBar.dispose();
  }

  public print(value: string | Buffer | { toString: () => string }): void {
    this.outputChannel.append(value.toString());
  }

  public println(value: string | Buffer | { toString: () => string }): void {
    this.outputChannel.appendLine(value.toString());
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
