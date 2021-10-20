import { commands, Disposable } from 'vscode';

import { Disposed } from './types';

export abstract class AbstractCommands<Signatures extends Record<string, [unknown, unknown]>> implements Disposed {
  protected commands: Disposable[] = [];
  protected commandKeys: (keyof Signatures)[] = [];

  public registerCommand<T extends keyof Signatures>(
    command: T,
    cb: (arg: Signatures[T][0]) => Promise<Signatures[T][1]> | Signatures[T][1]
  ): Disposable | undefined {
    if (this.commandKeys.includes(command)) return;

    const disposable = commands.registerCommand(command as string, cb);

    this.commands.push(disposable);
    this.commandKeys.push(command);

    return disposable;
  }

  public execCommand<T extends keyof Signatures>(
    command: T,
    arg?: Signatures[T][0]
  ): Promise<Signatures[T][1] | undefined> {
    return new Promise((resolve, reject) => {
      commands.executeCommand<Signatures[T][1]>(command as string, arg).then(resolve, reject);
    });
  }

  public dispose(): void {
    this.commands.forEach((command) => command.dispose());
    this.commandKeys = [];
  }
}
