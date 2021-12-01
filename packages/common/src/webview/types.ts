import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { Artifact, CompilerOutput } from '@carpo-remix/helper/types';

import { ethers } from 'ethers';

export type AccountType = { address: string; balance: ethers.BigNumber };
export type Uri = { path: string; scheme: string };
export type ProviderSendRequest = {
  nameOrUrl: string;
  data: {
    method: string;
    params: any[];
  };
};
export interface Deployment extends Artifact {
  address: string;
  transactionHash: string;
  chainId: number;
}

export interface RequestSignatures {
  /** common */
  'workspace.path': [null, string | null];
  'workspace.config': [null, WorkspaceConfig | null];
  'workspace.setConfig': [WorkspaceConfig, WorkspaceConfig];
  'workspace.runDevNode': [null, void];
  'solidity.releases': [null, Record<string, string>];
  'contracts.files': [null, string[]];
  'artifacts.all': [null, Artifact[]];
  'artifacts.one': [string, Artifact];
  /** carpo-core extension */
  'carpo-core.genConfig': [WorkspaceConfig, WorkspaceConfig | undefined];
  /** carpo-compiler extension */
  'carpo-compiler.compile': [string[], CompilerOutput];
  /** carpo-deploy extension */
  'carpo-deploy.providerSend': [ProviderSendRequest, any];
  'carpo-deploy.saveDeployment': [Deployment, Deployment];
}

export type MessageTypes = keyof RequestSignatures;

export type RequestTypes = {
  [MessageType in MessageTypes]: RequestSignatures[MessageType][0];
};

export type ResponseTypes = {
  [MessageType in MessageTypes]: RequestSignatures[MessageType][1];
};

export type SubscriptionTypes = {
  [MessageType in MessageTypes]: RequestSignatures[MessageType][2];
};

export interface TransportRequestMessage<TMessageType extends MessageTypes> {
  id: string;
  message: TMessageType;
  request: RequestTypes[TMessageType];
}

export interface TransportResponseMessage<TMessageType extends MessageTypes> {
  id: string;
  response?: ResponseTypes[TMessageType];
  error?: string;
}

export interface TransportSubscriptionMessage<TMessageType extends MessageTypes> {
  id: string;
  subscription?: ResponseTypes[TMessageType];
  error?: string;
}

export interface Handler {
  resolve: (data?: any) => void;
  reject: (error: Error) => void;
  subscriber?: (data: any) => void;
}
export type Handlers = Record<string, Handler>;
