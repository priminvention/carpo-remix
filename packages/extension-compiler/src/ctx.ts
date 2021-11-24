import type { Disposed } from '@carpo-remix/common/types';
import type { CompilerOutput } from '@carpo-remix/helper/types';
import type { InterfaceEvents } from './types';

import { SourceManager } from '@carpo-remix/common';
import { compile } from '@carpo-remix/common/solidity';
import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { Events } from '@carpo-remix/helper/events';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import path from 'path';

export class CompilerContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  #sourceManager: SourceManager;

  constructor() {
    super();

    this.#sourceManager = new SourceManager();

    this.#sourceManager.on('change', this.sourceChange.bind(this));
    this.emit('ready', this);
  }

  private sourceChange(filePath: string): void {
    const config = getWorkspaceConfig(getWorkspacePath());

    if (config?.autoCompile) {
      this.compile([path.relative(getWorkspacePath(), filePath)]).catch(console.error);
    }
  }

  public compile(filenames: string[]): Promise<CompilerOutput> {
    return compile(filenames);
  }

  public dispose(): void {
    this.#sourceManager.off('change', this.sourceChange.bind(this));
    this.#sourceManager.dispose();
  }
}
