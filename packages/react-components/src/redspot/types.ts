import type { RedspotConfig } from 'redspot/types/config';

export interface RedspotState {
  workspacePath?: string;
  config?: RedspotConfig;
  changeConfig(_config: RedspotConfig): Promise<RedspotConfig>;
}
