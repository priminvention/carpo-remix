/* eslint-disable no-case-declarations */
import type { MessageTypes, RequestTypes, ResponseTypes } from './types';

import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { mergeWorkspaceConfig } from '@carpo-remix/config/mergeWorkspaceConfig';
import { WorkspaceConfig } from '@carpo-remix/config/types';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';

import { findContracts, getArtifacts, getSolidityReleases } from '../solidity';

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
  const workspacePath = getWorkspacePath();

  try {
    if (cb) {
      return cb(id, type, request);
    } else {
      throw new Error('no function');
    }
  } catch (error) {
    switch (type) {
      case 'workspace.path':
        return Promise.resolve(workspacePath);

      case 'workspace.config':
        return Promise.resolve(getWorkspaceConfig(workspacePath));

      case 'workspace.setConfig':
        const config = getWorkspaceConfig(workspacePath);

        return Promise.resolve(mergeWorkspaceConfig(workspacePath, config || {}, request as WorkspaceConfig));

      case 'solidity.releases':
        return getSolidityReleases();

      case 'contracts.files':
        return findContracts();

      case 'artifacts.all':
        return getArtifacts(workspacePath);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}
