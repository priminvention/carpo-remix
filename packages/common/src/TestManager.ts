import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { GlobPattern } from 'vscode';
import type { Disposed } from './types';

import path from 'path';

import { FilesManager } from './FilesManager';
import { ConfigManager } from '.';

export class TestManager extends FilesManager implements Disposed {
  public static getGlobPattern(workspacePath: string, config: WorkspaceConfig | null): GlobPattern {
    return {
      base: path.resolve(workspacePath, config?.paths?.tests ?? 'tests'),
      pattern: '*.{spec,test}.{ts,js}'
    };
  }

  #configManager: ConfigManager;
  private workspacePath: string;

  constructor(workspacePath: string) {
    const configManager = new ConfigManager(workspacePath);

    super(TestManager.getGlobPattern(workspacePath, configManager.config));

    this.workspacePath = workspacePath;

    configManager.on('change:paths', this.configChange.bind(this));
    configManager.on('create', this.configCreateOrDelete.bind(this));
    configManager.on('delete', this.configCreateOrDelete.bind(this));
    this.#configManager = configManager;
  }

  private configChange([config]: [WorkspaceConfig | null, WorkspaceConfig | null]): void {
    this.createWatcher(TestManager.getGlobPattern(this.workspacePath, config));
  }

  private configCreateOrDelete(config: WorkspaceConfig | null): void {
    this.createWatcher(TestManager.getGlobPattern(this.workspacePath, config));
  }

  public dispose(): void {
    super.dispose();
    this.#configManager.off('change:paths', this.configChange.bind(this));
    this.#configManager.off('create', this.configCreateOrDelete.bind(this));
    this.#configManager.off('delete', this.configCreateOrDelete.bind(this));
  }
}
