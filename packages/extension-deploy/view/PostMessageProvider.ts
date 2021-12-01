import { sendMessage } from '@carpo-remix/common/webview/sendMessage';
import { providers } from 'ethers';

export class PostMessageProvider extends providers.JsonRpcProvider {
  private nameOrUrl: string;

  constructor(nameOrUrl: string) {
    super();
    this.nameOrUrl = nameOrUrl;
  }

  public send(method: string, params: any[]): Promise<any> {
    return sendMessage('carpo-deploy.providerSend', {
      nameOrUrl: this.nameOrUrl,
      data: {
        method,
        params
      }
    });
  }
}
