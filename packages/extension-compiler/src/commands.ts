import type { CompilerOutput } from 'solc';

import { AbstractCommands } from '@carpo-remix/common';

export type CompilerCommandSignatures = {
  'carpo-compiler.compile': [string[], CompilerOutput];
};

export class CompilerCommands extends AbstractCommands<CompilerCommandSignatures> {}
