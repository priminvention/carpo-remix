import type { Handle } from '@carpo-remix/common/webview/handle';
import type { Deployment, ProviderSendRequest } from '@carpo-remix/common/webview/types';

import { AbstractViewProvider } from '@carpo-remix/common';
import { getArtifacts } from '@carpo-remix/helper';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import fs from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';

import { DeployContext } from './ctx';

export default class DeployWebviewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpoDeploy.deployView';
  private ctx: DeployContext;

  constructor(_extensionUri: vscode.Uri, ctx: DeployContext) {
    super(_extensionUri, 'build/view', (id, type, request) => this.handle(id, type, request));
    this.ctx = ctx;
  }

  private handle: Handle = async (id, type, request) => {
    const workspacePath = getWorkspacePath();

    switch (type) {
      case 'artifacts.all':
        return getArtifacts(workspacePath);

      case 'carpo-deploy.providerSend':
        const { data, nameOrUrl } = request as ProviderSendRequest;
        const provider = this.ctx.getProvider(nameOrUrl);

        return provider.send(data.method, data.params);

      case 'carpo-deploy.saveDeployment':
        const deployment = request as Deployment;

        const deploymentFile = path.resolve(
          workspacePath,
          'deployments',
          `chainId_${deployment.chainId.toString()}`,
          `${deployment.contractName}.json`
        );

        fs.ensureFileSync(deploymentFile);
        fs.writeJsonSync(deploymentFile, deployment, {
          spaces: 2
        });

        return Promise.resolve(deployment);

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  };
}
