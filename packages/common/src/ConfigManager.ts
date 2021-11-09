import type { Disposed } from './types';

import { defaultConfigName } from '@carpo-remix/config';
import { AbstractConfigManager } from '@carpo-remix/config/AbstratConfigManager';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import * as vscode from 'vscode';

export class ConfigManager extends AbstractConfigManager implements Disposed {
  #watcher: vscode.FileSystemWatcher;

  constructor() {
    super(getWorkspacePath());
    this.#watcher = vscode.workspace.createFileSystemWatcher(
      {
        base: this.workspacePath,
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
