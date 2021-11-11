import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { CompilerOutput } from '@carpo-remix/helper/types';

export interface CommandSignatures {
  'carpo-core.openQuickPick': [undefined, void];
  'carpo-core.genConfig': [WorkspaceConfig, WorkspaceConfig | undefined];
  'carpo-core.createProject': [undefined, void];
  'carpo-core.runDevNode': [undefined, void];
  'carpo-core.runScript': [string, any];
  'carpo-core.runTest': [string | undefined, any];
  'carpo-compiler.compile': [string[], CompilerOutput];
}

export type CommandKeys = keyof CommandSignatures;

export type CommandArgs = {
  [CommandKey in CommandKeys]: CommandSignatures[CommandKey][0];
};

export type CommandReturns = {
  [CommandKey in CommandKeys]: CommandSignatures[CommandKey][1];
};
