import type { MessageTypes, RequestTypes, ResponseTypes } from './types';

import * as vscode from 'vscode';

import { getSolidityReleases } from '../solidity';

export interface Handle {
  <TMessageType extends MessageTypes>(id: string, type: TMessageType, request: RequestTypes[TMessageType]): Promise<
    ResponseTypes[keyof ResponseTypes]
  >;
}

export async function handle<TMessageType extends MessageTypes>(
  id: string,
  type: TMessageType,
  request: RequestTypes[TMessageType],
  cb?: Handle
): Promise<ResponseTypes[keyof ResponseTypes]> {
  try {
    if (cb) {
      return cb(id, type, request);
    } else {
      throw new Error('no function');
    }
  } catch (error) {
    switch (type) {
      case 'workspace.path':
        return Promise.resolve(
          vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders.map(({ uri }) => {
                return uri.path;
              })[0]
            : null
        );

      case 'solidity.releases':
        return getSolidityReleases();

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}
