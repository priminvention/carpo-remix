import type { Handle } from '@carpo-remix/common/webview/handle';

import { AbstractViewProvider } from '@carpo-remix/common';
import { ContractCallReqTypes, ContractDeployReqType } from '@carpo-remix/common/webview/types';
import { getArtifacts } from '@carpo-remix/helper';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import * as vscode from 'vscode';

import Provider from './Provider';

export default class DeployWebviewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpoDeploy.deployView';

  constructor(_extensionUri: vscode.Uri) {
    super(_extensionUri, 'build/view', (id, type, request) => this.handle(id, type, request));
  }

  private handle: Handle = async (id, type, request) => {
    const workspacePath = getWorkspacePath();

    switch (type) {
      case 'carpo-deploy.accounts':
        return Provider.getAccountList();
      case 'carpo-deploy.run':
        return Provider.deploy(<ContractDeployReqType>request);
      case 'carpo-deploy.call':
        return Provider.call(<ContractCallReqTypes>request);
      case 'artifacts.all':
        return getArtifacts(workspacePath);
      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };
}
