import type { MessageTypes, TransportRequestMessage, TransportResponseMessage } from './types';

import * as vscode from 'vscode';

import { getHtmlForWebview } from './getHtmlForWebview';
import { Handle, handle } from './handle';

export function createWebviewPanel<TMessageType extends MessageTypes>(
  viewType: string,
  name: string,
  viewColumn: vscode.ViewColumn,
  extensionUri: vscode.Uri,
  sourceName: string,
  cb?: Handle
): vscode.WebviewPanel {
  const panel = vscode.window.createWebviewPanel(viewType, name, viewColumn, {
    enableScripts: true,
    localResourceRoots: [extensionUri]
  });

  panel.webview.html = getHtmlForWebview(extensionUri, sourceName, panel.webview);

  panel.webview.onDidReceiveMessage((data: TransportRequestMessage<TMessageType>) => {
    const promise = handle(data.id, data.message, data.request, cb);

    promise
      .then((response) => {
        return panel.webview.postMessage({
          id: data.id,
          response
        } as TransportResponseMessage<TMessageType>);
      })
      .catch((error: Error) => {
        return panel.webview.postMessage({
          error: error.message,
          id: data.id
        });
      });
  });

  return panel;
}
