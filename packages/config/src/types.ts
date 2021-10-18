export type NetworksConfig = {
  rpc?: string;
  accounts?: string[];
  chainId: number;
};

export type ProjectConfig = {
  paths?: {
    sources?: string;
    artifacts?: string;
    tests?: string;
  };
  networks?: NetworksConfig;
  defaultNetwork?: string;
  solidity?: {
    version?: string;
    settings?: any;
  };
};
