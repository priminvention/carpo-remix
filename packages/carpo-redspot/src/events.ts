import type { InterfaceEvents, InterfaceEventType } from './types';

import EventEmitter from 'eventemitter3';

export class Events {
  #eventemitter = new EventEmitter();

  protected emit<T extends InterfaceEventType>(type: T, data: InterfaceEvents[T]): boolean {
    return this.#eventemitter.emit(type, data);
  }

  public on<T extends InterfaceEventType>(type: T, handler: (data: InterfaceEvents[T]) => void): this {
    this.#eventemitter.on(type, handler);

    return this;
  }

  public off<T extends InterfaceEventType>(
    type: InterfaceEventType,
    handler: (data: InterfaceEvents[T]) => void
  ): this {
    this.#eventemitter.removeListener(type, handler);

    return this;
  }

  public once<T extends InterfaceEventType>(
    type: InterfaceEventType,
    handler: (data: InterfaceEvents[T]) => void
  ): this {
    this.#eventemitter.once(type, handler);

    return this;
  }
}
