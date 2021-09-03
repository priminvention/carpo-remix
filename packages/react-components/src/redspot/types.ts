import type { RedspotConfig } from 'redspot/types/config';

export interface RedspotState {
  config?: RedspotConfig;
  changeConfig(_config: RedspotConfig): Promise<RedspotConfig>;
}
