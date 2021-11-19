import type { Disposed } from './types';

import { Events } from '@carpo-remix/helper';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import path from 'path';
import * as vscode from 'vscode';

import { ConfigManager } from './ConfigManager';

interface TestManagerEvents {
  change: string[];
  create: string[];
  delete: string[];
}

export class TestManager extends Events<TestManagerEvents, keyof TestManagerEvents> implements Disposed {
  #workspacePath: string;
  #configManager: ConfigManager;
  #watcher: vscode.FileSystemWatcher;
  public files: string[] = [];

  constructor() {
    super();

    this.#workspacePath = getWorkspacePath();
    this.#configManager = new ConfigManager();
    this.#configManager.on('change', this.createWatcher.bind(this));
    this.#configManager.on('create', this.createWatcher.bind(this));
    this.#configManager.on('delete', this.createWatcher.bind(this));
    this.#watcher = this.createWatcher();
  }

  private createWatcher(): vscode.FileSystemWatcher {
    if (this.#watcher) {
      this.#watcher.dispose();
    }

    this.#watcher = vscode.workspace.createFileSystemWatcher(
      {
        base: path.resolve(this.#workspacePath, this.#configManager.config?.paths?.tests ?? 'test'),
        pattern: '*.{spec,test}.{ts,js}'
      },
      false,
      false,
      false
    );

    this.#watcher.onDidCreate(this.onDidCreate.bind(this));
    this.#watcher.onDidChange(this.onDidChange.bind(this));
    this.#watcher.onDidDelete(this.onDidDelete.bind(this));

    return this.#watcher;
  }

  private async onDidCreate(): Promise<void> {
    this.files = await this.getTestFiles();
    this.emit('create', this.files);
  }

  private async onDidChange(): Promise<void> {
    this.files = await this.getTestFiles();
    this.emit('change', this.files);
  }

  private async onDidDelete(): Promise<void> {
    this.files = await this.getTestFiles();
    this.emit('delete', this.files);
  }

  public async getTestFiles(): Promise<string[]> {
    return (
      await vscode.workspace.findFiles({
        base: path.resolve(this.#workspacePath, this.#configManager.config?.paths?.tests ?? 'test'),
        pattern: '*.{spec,test}.{ts,js}'
      })
    ).map((uri) => uri.path);
  }

  public dispose(): void {
    this.#watcher.dispose();
    this.#configManager.dispose();
  }
}
