import type { SoliditySettings } from '@carpo-remix/helper/types';

export type NetworksConfig = {
  rpc?: string;
  accounts?: string[];
  chainId: number;
};

export type PathsConfig = {
  sources?: string;
  artifacts?: string;
  tests?: string;
};

export type SolidityConfig = {
  version?: string;
  settings?: SoliditySettings;
};

export type WorkspaceConfig = {
  paths?: PathsConfig;
  networks?: NetworksConfig;
  defaultNetwork?: string;
  solidity?: SolidityConfig;
  autoCompile?: boolean;
};
