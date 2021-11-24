import type { SourceManager } from '@carpo-remix/common';
import type { Disposed } from '@carpo-remix/common/types';
import type { CompilerOutput } from '@carpo-remix/helper/types';
import type { Uri } from 'vscode';
import type { InterfaceEvents } from './types';

import { compile } from '@carpo-remix/common/solidity';
import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { Events } from '@carpo-remix/helper/events';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';

export class CompilerContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  #sourceManager: SourceManager;

  constructor(sourceManager: SourceManager) {
    super();

    this.#sourceManager = sourceManager;

    this.#sourceManager.on('change', this.sourceChange.bind(this));
    this.emit('ready', this);
  }

  private sourceChange(filename: string | Uri): void {
    const config = getWorkspaceConfig(getWorkspacePath());

    if (config?.autoCompile) {
      this.compileOne(filename).catch(console.error);
    }
  }

  public compile(filenames: string[]): Promise<CompilerOutput> {
    return compile(filenames);
  }

  public compileOne(filename: Uri | string): Promise<CompilerOutput> {
    if (typeof filename === 'string') {
      return this.compile([filename]);
    } else {
      return this.compile([filename.path]);
    }
  }

  public dispose(): void {
    this.#sourceManager.off('change', this.sourceChange.bind(this));
    this.#sourceManager.dispose();
  }
}
