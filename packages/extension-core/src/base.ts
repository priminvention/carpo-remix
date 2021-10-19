import type { Disposable, OutputChannel, QuickPickItem, StatusBarItem } from 'vscode';
import type { InterfaceEvents } from './types';

import { CommandSignatures, CommandTypes, execCommand, registerCommand } from '@carpo-remix/common/commands';
import { Events } from '@carpo-remix/common/events';
import { Disposed } from '@carpo-remix/common/types';
import { defaultConfigName } from '@carpo-remix/config';
import { ProjectConfig } from '@carpo-remix/config/types';
import fs from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';

interface CommandQuickPickItem extends QuickPickItem {
  command: CommandTypes;
  arg?: CommandSignatures[CommandTypes][0];
}

export class Base extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  public outputChannel: OutputChannel;
  public statusBar: StatusBarItem;
  #quickPick: vscode.QuickPick<CommandQuickPickItem>;
  #commands: Disposable[];

  constructor(workspace: string) {
    super();
    this.#quickPick = vscode.window.createQuickPick();
    this.#commands = [
      registerCommand('carpo-core.openQuickPick', () => {
        this.#quickPick.items = [{ label: 'Create Project', command: 'carpo-core.genConfig', arg: {} }];
        this.#quickPick.show();
      }),
      registerCommand('carpo-core.genConfig', (arg: ProjectConfig) => {
        fs.writeJsonSync(path.resolve(workspace, defaultConfigName), arg, {
          spaces: 2
        });

        return arg;
      })
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
