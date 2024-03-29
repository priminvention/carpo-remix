import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { Artifact, CompilerOutput } from '@carpo-remix/helper/types';

import { ethers } from 'ethers';

export type AccountType = { address: string; balance: string };
export type Uri = { path: string; scheme: string };
export type ContractDeployReqType = { artifact: any; account: string; constractParams: unknown[] };
export type ContractDeployResType = { addr: string; fnFragment: Array<ethers.utils.FunctionFragment> }[];
export type ContractCallReqTypes = { addr: string; fragmentName: string; inputArgs: any[] };

export interface RequestSignatures {
  /** common */
  'workspace.path': [null, string | null];
  'workspace.config': [null, WorkspaceConfig | null];
  'workspace.setConfig': [WorkspaceConfig, WorkspaceConfig];
  'workspace.runDevNode': [null, void];
  'solidity.releases': [null, Record<string, string>];
  'contracts.files': [null, string[]];
  'artifacts.all': [null, Artifact[]];
  /** carpo-core extension */
  'carpo-core.genConfig': [WorkspaceConfig, WorkspaceConfig | undefined];
  /** carpo-compiler extension */
  'carpo-compiler.compile': [string[], CompilerOutput];
  /** carpo-deploy extension */
  'carpo-deploy.accounts': [null, AccountType[]];
  'carpo-deploy.run': [ContractDeployReqType, ContractDeployResType];
  'carpo-deploy.call': [ContractCallReqTypes, void];
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
