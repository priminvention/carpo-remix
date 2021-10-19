import { Disposed } from '@carpo-remix/common/types';
import * as vscode from 'vscode';

import { Base } from './base';

export class CoreContext extends Base implements Disposed {
  constructor(ctx: vscode.ExtensionContext) {
    super(ctx);
    this.emit('ready', this);
  }

  public dispose(): any {
    super.dispose();
  }
}
