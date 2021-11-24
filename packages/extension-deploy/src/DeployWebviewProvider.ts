import type { Handle } from '@carpo-remix/common/webview/handle';
import { AbstractViewProvider } from '@carpo-remix/common';
import * as vscode from 'vscode';
import { toast } from '@carpo-remix/utils';
import Provider from './Provider';
import { getArtifacts } from '@carpo-remix/helper';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import { ContractDeployReqType, ContractCallReqTypes } from '@carpo-remix/common/webview/types';

export default class DeployWebviewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpoDeploy.deployView';

  constructor(_extensionUri: vscode.Uri) {
    super(_extensionUri, 'build/view', (id, type, request) => this.handle(id, type, request));
  }

  private handle: Handle = async (id, type, request) => {
    const workspacePath = getWorkspacePath();
    switch (type) {
      case 'workspace.toast':
        toast.info(<string>request);
      case 'carpo-deploy.accounts':
        return Provider.getAccountList();
      case 'carpo-deploy.run':
        return Provider.deploy(<ContractDeployReqType>request);
      case 'carpo-deploy.call':
        Provider.call(<ContractCallReqTypes>request);
      case 'artifacts.all':
        return getArtifacts(workspacePath);
      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };
}
