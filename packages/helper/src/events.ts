import EventEmitter from 'eventemitter3';

export class Events<IE extends Record<string, any>, IET extends string> {
  #eventemitter = new EventEmitter();

  protected emit<T extends IET>(type: T, data: IE[T]): boolean {
    return this.#eventemitter.emit(type, data);
  }

  public on<T extends IET>(type: T, handler: (data: IE[T]) => any): this {
    this.#eventemitter.on(type, handler);

    return this;
  }

  public off<T extends IET>(type: T, handler: (data: IE[T]) => any): this {
    this.#eventemitter.removeListener(type, handler);

    return this;
  }

  public once<T extends IET>(type: T, handler: (data: IE[T]) => any): this {
    this.#eventemitter.once(type, handler);

    return this;
  }
}
