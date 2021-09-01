import path from 'path';

export const redspotConfigTemplate = (workspacePath: string): string => {
  return `// gen by carpo, don't delete
import '@redspot/chai';
import '@redspot/patract';
import config from '${path.resolve(workspacePath, 'redspot.config')}';

export default config;
`;
};
