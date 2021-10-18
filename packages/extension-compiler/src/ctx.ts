import { Events } from '@carpo-remix/common/events';

import { InterfaceEvents } from './types';

export class CompilerContext extends Events<InterfaceEvents, keyof InterfaceEvents> {
  constructor() {
    super();
    this.emit('ready', this);
  }
}
