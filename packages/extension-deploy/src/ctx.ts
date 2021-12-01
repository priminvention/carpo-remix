import type { Disposed } from '@carpo-remix/common/types';
import type { InterfaceEvents } from './types';

import { Events } from '@carpo-remix/helper/events';
import { providers } from 'ethers';

export class DeployContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  #providers: Record<string, providers.JsonRpcProvider> = {};

  constructor() {
    super();

    this.emit('ready', this);
  }

  public getProvider(nameOrUrl: string): providers.JsonRpcProvider {
    if (this.#providers[nameOrUrl]) {
      return this.#providers[nameOrUrl];
    }

    if (nameOrUrl === 'development') {
      return (this.#providers[nameOrUrl] = new providers.JsonRpcProvider('http://127.0.0.1:8545'));
    }

    return (this.#providers[nameOrUrl] = new providers.JsonRpcProvider(nameOrUrl));
  }

  public dispose(): void {
    console.log('dispose');
  }
}
