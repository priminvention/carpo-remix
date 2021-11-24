import type { Disposed } from './types';

import { defaultConfigName } from '@carpo-remix/config';
import { AbstractConfigManager } from '@carpo-remix/config/AbstratConfigManager';
import * as vscode from 'vscode';

export class ConfigManager extends AbstractConfigManager implements Disposed {
  #watcher: vscode.FileSystemWatcher;

  constructor(workspacePath: string) {
    super(workspacePath);
    this.#watcher = vscode.workspace.createFileSystemWatcher(
      {
        base: workspacePath,
        pattern: defaultConfigName
      },
      false,
      false,
      false
    );

    this.#watcher.onDidCreate(this.onDidCreate.bind(this));
    this.#watcher.onDidChange(this.onDidChange.bind(this));
    this.#watcher.onDidDelete(this.onDidDelete.bind(this));
  }

  public dispose(): void {
    this.#watcher?.dispose();
  }
}
