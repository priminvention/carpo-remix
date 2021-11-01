import type { Disposed } from '@carpo-remix/common/types';

import { AbstractViewProvider } from '@carpo-remix/common';
import { Events } from '@carpo-remix/common/events';
import { compile } from '@carpo-remix/common/solidity';

import { CompilerCommands } from './commands';
import { InterfaceEvents } from './types';

export class CompilerContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  public commands: CompilerCommands;

  constructor() {
    super();
    this.commands = new CompilerCommands();
    this.init();

    this.emit('ready', this);
  }

  private init(): void {
    this.commands.registerCommand('carpo-compiler.compile', (filenames: string[]) => compile(filenames));
  }

  public dispose(): void {
    this.commands.dispose();
  }
}
