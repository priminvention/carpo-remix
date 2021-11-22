import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { Artifact, CompilerOutput } from '@carpo-remix/helper/types';
import { TaskExecution } from 'vscode';

export type Uri = {
  path: string;
  scheme: string;
};

export interface RequestSignatures {
  /** common */
  'workspace.path': [null, string | null];
  'workspace.config': [null, WorkspaceConfig | null];
  'workspace.setConfig': [WorkspaceConfig, WorkspaceConfig];
  'workspace.toast': [string, void];
  'workspace.runDevNode': [null, void];
  'solidity.releases': [null, Record<string, string>];
  'contracts.files': [null, string[]];
  'artifacts.all': [null, Artifact[]];
  /** carpo-core extension */
  'carpo-core.genConfig': [WorkspaceConfig, WorkspaceConfig | undefined];
  /** carpo-compiler extension */
  'carpo-compiler.compile': [string[], CompilerOutput];
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
