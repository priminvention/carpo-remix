export type Uri = {
  path: string;
  scheme: string;
};

export interface RequestSignatures {
  'workspace.path': [null, string | null];
  'solidity.releases': [null, Record<string, string>];
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

export interface SendRequest {
  <TMessageType extends MessageTypes>(message: TMessageType, request: RequestTypes[TMessageType]): Promise<
    ResponseTypes[TMessageType]
  >;
  <TMessageType extends MessageTypes>(
    message: TMessageType,
    request: RequestTypes[TMessageType],
    subscriber: (data: SubscriptionTypes[TMessageType]) => void
  ): Promise<ResponseTypes[TMessageType]>;
}

export interface Handler {
  resolve: (data?: any) => void;
  reject: (error: Error) => void;
  subscriber?: (data: any) => void;
}
export type Handlers = Record<string, Handler>;
