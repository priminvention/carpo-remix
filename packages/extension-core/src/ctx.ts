import { Events } from '@carpo-remix/common/events';
import { Disposed } from '@carpo-remix/common/types';

import { Commands } from './commands';
import { InterfaceEvents } from './types';

export class CoreContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  #commands: Commands;

  constructor(workspace: string) {
    super();
    this.#commands = new Commands(workspace);
    this.emit('ready', this);
  }

  public dispose(): any {
    this.#commands.dispose();
  }
}
