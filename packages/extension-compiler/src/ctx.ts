import type { Disposed } from '@carpo-remix/common/types';
import type { CompilerOutput } from '@carpo-remix/helper/types';
import type { Uri } from 'vscode';
import type { InterfaceEvents } from './types';

import { setContext, SourceManager } from '@carpo-remix/common';
import { compile } from '@carpo-remix/common/solidity';
import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { Events } from '@carpo-remix/helper/events';
import * as vscode from 'vscode';

export class CompilerContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  #sourceManager: SourceManager;
  private workspacePath: string;

  constructor(workspacePath: string, sourceManager: SourceManager) {
    super();

    this.workspacePath = workspacePath;
    this.#sourceManager = sourceManager;
    this.#sourceManager.on('change', this.sourceChange.bind(this));

    vscode.window.onDidChangeActiveTextEditor(async (e) => {
      await sourceManager.isInit;

      if (e && sourceManager.files.includes(e.document.uri.path)) {
        setContext('carpo-compiler.sourceViewOpen', true).catch(console.error);
      } else {
        setContext('carpo-compiler.sourceViewOpen', false).catch(console.error);
      }
    });

    this.emit('ready', this);
  }

  private sourceChange(filename: string | Uri): void {
    const config = getWorkspaceConfig(this.workspacePath);

    if (config?.autoCompile) {
      this.compileOne(filename).catch(console.error);
    }
  }

  public compile(filenames: string[]): Promise<CompilerOutput> {
    return compile(this.workspacePath, filenames);
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
