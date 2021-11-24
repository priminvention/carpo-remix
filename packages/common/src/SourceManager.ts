import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { GlobPattern } from 'vscode';
import type { Disposed } from './types';

import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import path from 'path';

import { FilesManager } from './FilesManager';
import { ConfigManager } from '.';

export class SourceManager extends FilesManager implements Disposed {
  public static getGlobPattern(config: WorkspaceConfig | null): GlobPattern {
    const workspacePath = getWorkspacePath();

    return {
      base: path.resolve(workspacePath, config?.paths?.sources ?? 'sources'),
      pattern: '*.sol'
    };
  }

  #configManager: ConfigManager;

  constructor() {
    const configManager = new ConfigManager();

    super(SourceManager.getGlobPattern(configManager.config));

    configManager.on('change:paths', this.configChange.bind(this));
    configManager.on('create', this.configCreateOrDelete.bind(this));
    configManager.on('delete', this.configCreateOrDelete.bind(this));
    this.#configManager = configManager;
  }

  private configChange([config]: [WorkspaceConfig | null, WorkspaceConfig | null]): void {
    this.createWatcher(SourceManager.getGlobPattern(config));
  }

  private configCreateOrDelete(config: WorkspaceConfig | null): void {
    this.createWatcher(SourceManager.getGlobPattern(config));
  }

  public dispose(): void {
    super.dispose();
    this.#configManager.off('change:paths', this.configChange.bind(this));
    this.#configManager.off('create', this.configCreateOrDelete.bind(this));
    this.#configManager.off('delete', this.configCreateOrDelete.bind(this));
  }
}
