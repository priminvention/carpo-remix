import path from 'path';

export const carpoConfigBase = (workspacePath: string): string => {
  return path.resolve(workspacePath, '.carpo');
};

export const redspotConfigPath = (workspacePath: string): string => {
  return path.resolve(carpoConfigBase(workspacePath), 'redspot.config.ts');
};

export const userSettingPath = (workspacePath: string): string => {
  return path.resolve(carpoConfigBase(workspacePath), 'setting.json');
};
