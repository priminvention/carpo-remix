import { Disposed } from '@carpo-remix/common/types';

import { Base } from './base';

export class CoreContext extends Base implements Disposed {
  constructor(workspace: string) {
    super(workspace);
    this.emit('ready', this);
  }

  public dispose(): any {
    super.dispose();
  }
}
