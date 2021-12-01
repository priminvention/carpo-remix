import type {
  Handlers,
  MessageTypes,
  RequestTypes,
  ResponseTypes,
  TransportRequestMessage,
  TransportResponseMessage
} from './types';

let idCounter = 0;
const handlers: Handlers = {};

declare function acquireVsCodeApi(): {
  postMessage: (params: any) => void;
  setState: <T extends Record<string, unknown>>(params: T) => void;
  getState: <K>() => Record<string, K>;
};

export const vscodeWebview = acquireVsCodeApi();

export const sendMessage = <TMessageType extends MessageTypes>(
  message: TMessageType,
  request?: RequestTypes[TMessageType],
  subscriber?: (data: unknown) => void
): Promise<ResponseTypes[TMessageType]> => {
  return new Promise((resolve, reject): void => {
    const id = `${Date.now()}.${++idCounter}`;

    handlers[id] = { reject, resolve, subscriber };

    const transportRequestMessage: TransportRequestMessage<TMessageType> = {
      id,
      message,
      request: request || (null as RequestTypes[TMessageType])
    };

    vscodeWebview.postMessage(transportRequestMessage);
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
