import type { ConfigManager } from '@carpo-remix/config/ConfigManager';
import type { CoreContext } from './ctx';

import * as vscode from 'vscode';

export interface CoreApi {
  ctx: CoreContext;
  configManager: ConfigManager;
}

export function getCoreApi(): CoreApi | null {
  const carpoCore = vscode.extensions.getExtension('carpo.carpo-core');

  if (carpoCore) {
    return carpoCore.exports;
  } else {
    return null;
  }
}
