import { NpmTask } from '.';

export class TestTask extends NpmTask {
  constructor(_path: string, args?: string) {
    super('Test', `node node_modules/.bin/mocha ${args || ''} "${_path}"`);
  }
}
