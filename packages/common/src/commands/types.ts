import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { CompilerOutput } from '@carpo-remix/helper/types';
import type { Uri } from 'vscode';

export interface ContextKeyValues {
  'carpo-core.testViewOpen': boolean;
  'carpo-compiler.sourceViewOpen': boolean;
}

export interface CommandSignatures {
  'carpo-core.openQuickPick': [undefined, void];
  'carpo-core.genConfig': [WorkspaceConfig, WorkspaceConfig | undefined];
  'carpo-core.createProject': [undefined, void];
  'carpo-core.runDevNode': [undefined, void];
  'carpo-core.runScript': [string | Uri, any];
  'carpo-core.runTest': [string | Uri | undefined, any];
  'carpo-core.runTestOne': [string | Uri, any];
  'carpo-compiler.compile': [string[], CompilerOutput];
  'carpo-compiler.compileOne': [string | Uri, CompilerOutput];
  'carpo-flattener.flatten': [string | Uri, string];
}

export type CommandKeys = keyof CommandSignatures;

export type CommandArgs = {
  [CommandKey in CommandKeys]: CommandSignatures[CommandKey][0];
};

export type CommandReturns = {
  [CommandKey in CommandKeys]: CommandSignatures[CommandKey][1];
};
