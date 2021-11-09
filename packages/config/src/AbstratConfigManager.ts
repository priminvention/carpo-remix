import type { WorkspaceConfig } from './types';

import { Events } from '@carpo-remix/helper';

import { getWorkspaceConfig } from './getWorkspaceConfig';
import { mergeWorkspaceConfig } from './mergeWorkspaceConfig';

export interface ConfigManagerEvents {
  change: WorkspaceConfig;
  create: WorkspaceConfig;
  delete: null;
}

export class AbstractConfigManager extends Events<ConfigManagerEvents, keyof ConfigManagerEvents> {
  protected config: WorkspaceConfig | null = null;
  protected workspacePath: string;

  constructor(workspacePath: string) {
    super();
    this.workspacePath = workspacePath;
    this.config = getWorkspaceConfig(this.workspacePath);
  }

  private updateConfig() {
    this.config = this.workspacePath ? getWorkspaceConfig(this.workspacePath) : null;
  }

  protected onDidCreate(): void {
    this.updateConfig();
    this.config && this.emit('create', this.config);
  }

  protected onDidChange(): void {
    this.updateConfig();
    this.config && this.emit('change', this.config);
  }

  protected onDidDelete(): void {
    this.config = null;
    this.emit('delete', null);
  }

  public toggleConfig(workspacePath: string, config: WorkspaceConfig): void {
    if (!this.config) return;

    this.config = mergeWorkspaceConfig(workspacePath, this.config, config);
  }
}
