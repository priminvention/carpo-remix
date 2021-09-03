import type {
  Handlers,
  MessageTypes,
  RequestTypes,
  SendRequest,
  TransportRequestMessage,
  TransportResponseMessage
} from './types';

let idCounter = 0;
const handlers: Handlers = {};

const vscode: {
  postMessage: (data: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
} = (window as any).acquireVsCodeApi();

export const sendMessage: SendRequest = <TMessageType extends MessageTypes>(
  message: TMessageType,
  request?: RequestTypes[TMessageType],
  subscriber?: (data: unknown) => void
) => {
  return new Promise((resolve, reject): void => {
    const id = `${Date.now()}.${++idCounter}`;

    handlers[id] = { reject, resolve, subscriber };

    const transportRequestMessage: TransportRequestMessage<TMessageType> = {
      id,
      message,
      request: request || (null as RequestTypes[TMessageType])
    };

    vscode.postMessage(transportRequestMessage);
  });
};

window.addEventListener(
  'message',
  <TMessageType extends MessageTypes>({ data }: { data: TransportResponseMessage<TMessageType> }) => {
    if (data.id) {
      handleResponse(data);
    } else {
      console.error('Missing id for response.');
    }
  }
);

const handleResponse = <TMessageType extends MessageTypes>(
  data: TransportResponseMessage<TMessageType> & { subscription?: string }
) => {
  const handler = handlers[data.id];

  if (!handler) {
    console.error(`Unknown response: ${JSON.stringify(data)}`);

    return;
  }

  if (!handler.subscriber) {
    delete handlers[data.id];
  }

  if (data.subscription) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    (handler.subscriber as Function)(data.subscription);
  } else if (data.error) {
    handler.reject(new Error(data.error));
  } else {
    handler.resolve(data.response);
  }
};
