import path from 'path';

export const redspotConfigTemplate = (workspacePath: string): string => {
  return `// gen by carpo, don't delete
import { RedspotUserConfig } from 'redspot/types';
import '@redspot/chai';
import '@redspot/patract';
import '${path.resolve(workspacePath, 'redspot.config')}';

import setting from './setting.json';

const workspacePath = '${workspacePath}';

export default setting;
`;
};
