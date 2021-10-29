import type { SoliditySettings } from 'solc';

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

export type ProjectConfig = {
  paths?: PathsConfig;
  networks?: NetworksConfig;
  defaultNetwork?: string;
  solidity?: SolidityConfig;
};
