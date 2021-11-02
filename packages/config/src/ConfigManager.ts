import type { Disposed } from '@carpo-remix/common/types';

import { Events } from '@carpo-remix/common/events';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import fs from 'fs-extra';
import { merge } from 'lodash';
import path from 'path';
import * as vscode from 'vscode';

import { getWorkspaceConfig } from './getWorkspaceConfig';
import { mergeWorkspaceConfig } from './mergeWorkspaceConfig';
import { WorkspaceConfig } from './types';
import { defaultConfigName } from '.';

export interface ConfigManagerEvents {
  change: WorkspaceConfig;
  create: WorkspaceConfig;
  delete: null;
}

export class ConfigManager extends Events<ConfigManagerEvents, keyof ConfigManagerEvents> implements Disposed {
  #config: WorkspaceConfig | null = null;
  #workspacePath: string;
  #watcher: vscode.FileSystemWatcher | null;

  constructor() {
    super();
    this.#workspacePath = getWorkspacePath();
    this.#config = getWorkspaceConfig(this.#workspacePath);
    this.#watcher = vscode.workspace.createFileSystemWatcher(
      {
        base: this.#workspacePath,
        pattern: defaultConfigName
      },
      false,
      false,
      false
    );

    this.#watcher?.onDidCreate(this.onDidCreate.bind(this));
    this.#watcher?.onDidChange(this.onDidChange.bind(this));
    this.#watcher?.onDidDelete(this.onDidDelete.bind(this));
  }

  public get config(): WorkspaceConfig | null {
    return this.#config;
  }

  private updateConfig() {
    this.#config = this.#workspacePath ? getWorkspaceConfig(this.#workspacePath) : null;
  }

  private onDidCreate(): void {
    this.updateConfig();
    this.#config && this.emit('create', this.#config);
  }

  private onDidChange(): void {
    this.updateConfig();
    this.#config && this.emit('change', this.#config);
  }

  private onDidDelete(): void {
    this.#config = null;
    this.emit('delete', null);
  }

  public toggleConfig(workspacePath: string, config: WorkspaceConfig): void {
    if (!this.#config) return;

    this.#config = mergeWorkspaceConfig(workspacePath, this.#config, config);
  }

  public dispose(): void {
    this.#watcher?.dispose();
  }
}
