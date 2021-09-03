import type { RedspotConfig } from 'redspot/types/config';

export interface RequestSignatures {
  'pri(redspot.getConfig)': [null, RedspotConfig, RedspotConfig];
}
