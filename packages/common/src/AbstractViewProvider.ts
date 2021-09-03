import type {
  MessageTypes,
  RequestTypes,
  ResponseTypes,
  TransportRequestMessage,
  TransportResponseMessage
} from './types';

import { CarpoContext } from 'carpo-redspot/ctx';
import * as vscode from 'vscode';

export abstract class AbstractViewProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;
  private readonly _extensionUri: vscode.Uri;
  private readonly _sourceName: string;
  private readonly _ctx: CarpoContext;

  constructor(_extensionUri: vscode.Uri, _sourceName: string, _ctx: CarpoContext) {
    this._extensionUri = _extensionUri;
    this._sourceName = _sourceName;
    this._ctx = _ctx;
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

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((data: TransportRequestMessage<TMessageType>): void => {
      const promise = this.handle(data.id, data.message, data.request);

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

  private async handle<TMessageType extends MessageTypes>(
    id: string,
    type: TMessageType,
    request: RequestTypes[TMessageType]
  ): Promise<ResponseTypes[keyof ResponseTypes]> {
    switch (type) {
      case 'redspot.getConfig':
        return Promise.resolve(this._ctx.redspotConfig);
      case 'redspot.setConfig':
        this._ctx.setRedspotConfig(request as RequestTypes['redspot.setConfig']);

        return Promise.resolve(request as ResponseTypes['redspot.setConfig']);
      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, `${this._sourceName}.js`));
    const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, `${this._sourceName}.css`));

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<link href="${stylesMainUri}" rel="stylesheet">

				<title>Compile</title>
			</head>
			<body>
        <div id="root"></div>
        <script nonce="${nonce}" src="${scriptUri}"></script>
			</body>
			</html>`;
  }
}

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
