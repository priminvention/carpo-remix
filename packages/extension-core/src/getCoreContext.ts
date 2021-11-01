import * as vscode from 'vscode';

import { CoreContext } from './ctx';

export function getCoreContext(): CoreContext | null {
  const carpoCore = vscode.extensions.getExtension('carpo.carpo-core');

  if (carpoCore) {
    return carpoCore.exports.ctx;
  } else {
    return null;
  }
}
