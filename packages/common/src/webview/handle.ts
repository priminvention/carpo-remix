import type { MessageTypes, RequestTypes, ResponseTypes } from './types';

import { getWorkspacePath } from '@carpo-remix/utils/workspace';

import { findContracts, getSolidityReleases } from '../solidity';
import { getArtifacts } from '../solidity/artifacts';

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
        return Promise.resolve(getWorkspacePath());

      case 'solidity.releases':
        return getSolidityReleases();

      case 'contracts.files':
        return findContracts();

      case 'artifacts.all':
        return getArtifacts(getWorkspacePath());

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}
