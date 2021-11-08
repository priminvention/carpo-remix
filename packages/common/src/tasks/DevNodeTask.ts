import { DEV_MNEMONIC } from '@carpo-remix/config';

import { NpmTask } from '.';

export class DevNodeTask extends NpmTask {
  constructor(mnemonic?: string) {
    super('Dev node', `node node_modules/.bin/ganache-cli --debug --verbose --mnemonic "${mnemonic || DEV_MNEMONIC}"`);
  }
}
