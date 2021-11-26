import type { Disposed } from '@carpo-remix/common/types';
import type { Uri } from 'vscode';
import type { InterfaceEvents } from './types';

import { Events } from '@carpo-remix/helper/events';

import flatten from './flatten';

export class FlattenerContext extends Events<InterfaceEvents, keyof InterfaceEvents> implements Disposed {
  private workspacePath: string;

  constructor(workspacePath: string) {
    super();

    this.workspacePath = workspacePath;

    this.emit('ready', this);
  }

  public async flatten(filename: string | Uri): Promise<string> {
    console.log(await flatten([typeof filename === 'string' ? filename : filename.path], this.workspacePath));

    return Promise.resolve('');
  }

  public dispose(): void {
    console.log('dispose');
  }
}
