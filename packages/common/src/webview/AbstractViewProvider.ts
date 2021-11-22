import type { MessageTypes, TransportRequestMessage, TransportResponseMessage } from './types';

import * as vscode from 'vscode';

import { getHtmlForWebview } from './getHtmlForWebview';
import { Handle, handle } from './handle';

export abstract class AbstractViewProvider implements vscode.WebviewViewProvider {
  protected _view?: vscode.WebviewView;
  protected readonly _extensionUri: vscode.Uri;
  protected readonly _sourceName: string;
  protected _handle: Handle;

  constructor(_extensionUri: vscode.Uri, _sourceName: string, _handle: Handle) {
    this._extensionUri = _extensionUri;
    this._sourceName = _sourceName;
    this._handle = _handle;
  }

  public resolveWebviewView<TMessageType extends MessageTypes>(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this._view = webviewView;

    webviewView.webview.options = {
      // Allow scripts in the webview
      enableScripts: true,

      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = getHtmlForWebview(this._extensionUri, this._sourceName, webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data: TransportRequestMessage<TMessageType>): void => {
      const promise = handle(data.id, data.message, data.request, this._handle);

      promise
        .then((response) => {
          return webviewView.webview.postMessage({
            id: data.id,
            response
          } as TransportResponseMessage<TMessageType>);
        })
        .catch((error: Error) => {
          return webviewView.webview.postMessage({
            error: error.message,
            id: data.id
          });
        });
    });
  }
}
