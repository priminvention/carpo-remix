import type { ProjectConfig } from '@carpo-remix/config/types';

import { commands, Disposable } from 'vscode';

export interface CommandSignatures {
  'carpo-core.openQuickPick': [void, void];
  'carpo-core.genConfig': [ProjectConfig, ProjectConfig];
}

export type CommandTypes = keyof CommandSignatures;

export function registerCommand<T extends CommandTypes>(
  command: T,
  cb: (arg: CommandSignatures[T][0]) => Promise<CommandSignatures[T][1]> | CommandSignatures[T][1]
): Disposable {
  return commands.registerCommand(command, cb);
}

export function execCommand<T extends CommandTypes>(
  command: T,
  arg?: CommandSignatures[T][0]
): Promise<CommandSignatures[T][1] | undefined> {
  return new Promise((resolve, reject) => {
    commands.executeCommand<CommandSignatures[T][1]>(command, arg).then(resolve, reject);
  });
}
