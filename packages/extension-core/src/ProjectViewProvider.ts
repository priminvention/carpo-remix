import { AbstractViewProvider, Handle } from '@carpo-remix/common';
import * as vscode from 'vscode';

export class ProjectViewProvider extends AbstractViewProvider {
  constructor(_extensionUri: vscode.Uri, _sourceName: string) {
    const handle: Handle = (id, type, request) => {
      switch (type) {
        default:
          throw new Error(`Unable to handle message of type ${type}`);
      }
    };

    super(_extensionUri, _sourceName, handle);
  }
}
