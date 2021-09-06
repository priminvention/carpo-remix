import type { InterfaceEvents } from './types';

import EventEmitter from 'eventemitter3';

export class Events {
  #eventemitter = new EventEmitter();

  protected emit(type: InterfaceEvents, ...args: any[]): boolean {
    return this.#eventemitter.emit(type, ...args);
  }

  public on(type: InterfaceEvents, handler: (...args: any[]) => any): this {
    this.#eventemitter.on(type, handler);

    return this;
  }

  public off(type: InterfaceEvents, handler: (...args: any[]) => any): this {
    this.#eventemitter.removeListener(type, handler);

    return this;
  }

  public once(type: InterfaceEvents, handler: (...args: any[]) => any): this {
    this.#eventemitter.once(type, handler);

    return this;
  }
}
