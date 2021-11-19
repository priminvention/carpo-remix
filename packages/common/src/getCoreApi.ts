import type { AbstractConfigManager } from '@carpo-remix/config';
import type { CoreContext } from 'carpo-core/ctx';
import type { TestManager } from '.';

import * as vscode from 'vscode';

export interface CoreApi {
  ctx: CoreContext;
  configManager: AbstractConfigManager;
  testManager: TestManager;
}

export function getCoreApi(): CoreApi | null {
  const carpoCore = vscode.extensions.getExtension('carpo.carpo-core');

  if (carpoCore) {
    return carpoCore.exports;
  } else {
    return null;
  }
}
