import type { WorkspaceConfig } from './types';

import { Events } from '@carpo-remix/helper';
import { isEqual } from 'lodash';

import { getWorkspaceConfig } from './getWorkspaceConfig';
import { mergeWorkspaceConfig } from './mergeWorkspaceConfig';

export interface ConfigManagerEvents {
  change: [WorkspaceConfig | null, WorkspaceConfig | null];
  'change:paths': [WorkspaceConfig | null, WorkspaceConfig | null];
  'change:solidity': [WorkspaceConfig | null, WorkspaceConfig | null];
  'change:networks': [WorkspaceConfig | null, WorkspaceConfig | null];
  'change:defaultNetwork': [WorkspaceConfig | null, WorkspaceConfig | null];
  create: WorkspaceConfig | null;
  delete: null;
}

export class AbstractConfigManager extends Events<ConfigManagerEvents, keyof ConfigManagerEvents> {
  public prevConfig: WorkspaceConfig | null = null;
  public config: WorkspaceConfig | null = null;
  protected workspacePath: string;

  constructor(workspacePath: string) {
    super();
    this.workspacePath = workspacePath;
    this.prevConfig = getWorkspaceConfig(this.workspacePath);
    this.config = getWorkspaceConfig(this.workspacePath);
  }

  private updateConfig() {
    this.prevConfig = this.config;
    this.config = this.workspacePath ? getWorkspaceConfig(this.workspacePath) : null;
  }

  protected onDidCreate(): void {
    this.updateConfig();
    this.emit('create', this.config);
  }

  protected onDidChange(): void {
    this.updateConfig();
    this.emit('change', [this.config, this.prevConfig]);

    if (!isEqual(this.config?.paths, this.prevConfig?.paths)) this.emit('change:paths', [this.config, this.prevConfig]);

    if (!isEqual(this.config?.solidity, this.prevConfig?.solidity))
      this.emit('change:solidity', [this.config, this.prevConfig]);

    if (!isEqual(this.config?.networks, this.prevConfig?.networks))
      this.emit('change:networks', [this.config, this.prevConfig]);

    if (!isEqual(this.config?.defaultNetwork, this.prevConfig?.defaultNetwork))
      this.emit('change:defaultNetwork', [this.config, this.prevConfig]);
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
