import type { CommandArgs, CommandKeys, CommandReturns, ContextKeyValues } from './types';

import { commands, Disposable } from 'vscode';

export function registerCommand<T extends CommandKeys>(
  command: T,
  cb: (arg: CommandArgs[T]) => Promise<CommandReturns[T]>
): Disposable {
  return commands.registerCommand(command, cb);
}

export async function execCommand<T extends CommandKeys>(
  command: T,
  args?: CommandArgs[T]
): Promise<CommandReturns[T] | undefined> {
  const all = await commands.getCommands();

  if (!all.includes(command)) throw new Error(`No command named ${command}`);

  return await commands.executeCommand<CommandReturns[T]>(command, args);
}

export async function setContext<Key extends keyof ContextKeyValues>(
  key: Key,
  value: ContextKeyValues[Key]
): Promise<void> {
  return await commands.executeCommand('setContext', key, value);
}
