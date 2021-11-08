import type { Disposed } from '@carpo-remix/common/types';
import type { InterfaceEvents } from './types';

import { Events } from '@carpo-remix/common/events';

export class DeployContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  constructor() {
    super();

    this.emit('ready', this);
  }

  public dispose(): void {
    console.log('dispose');
  }
}
