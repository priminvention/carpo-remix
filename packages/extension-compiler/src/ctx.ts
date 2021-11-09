import type { Disposed } from '@carpo-remix/common/types';
import type { CompilerOutput } from '@carpo-remix/helper/types';
import type { InterfaceEvents } from './types';

import { compile } from '@carpo-remix/common/solidity';
import { Events } from '@carpo-remix/helper/events';

export class CompilerContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  constructor() {
    super();

    this.emit('ready', this);
  }

  public compile(filenames: string[]): Promise<CompilerOutput> {
    return compile(filenames);
  }

  public dispose(): void {
    console.log('dispose');
  }
}
