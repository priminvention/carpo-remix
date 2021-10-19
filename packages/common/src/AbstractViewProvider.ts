import type {
  MessageTypes,
  RequestTypes,
  ResponseTypes,
  TransportRequestMessage,
  TransportResponseMessage
} from './types/messages';

import * as vscode from 'vscode';

export interface Handle {
  <TMessageType extends MessageTypes>(id: string, type: TMessageType, request: RequestTypes[TMessageType]): Promise<
    ResponseTypes[TMessageType]
  >;
}

async function handle<TMessageType extends MessageTypes>(
  id: string,
  type: TMessageType,
  request: RequestTypes[TMessageType],
  cb?: Handle
): Promise<ResponseTypes[TMessageType]> {
  try {
    if (cb) {
      return cb(id, type, request);
    } else {
      throw new Error('no function');
    }
  } catch (error) {
    switch (type) {
      case 'workspace.path':
        return Promise.resolve(
          vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
            ? vscode.workspace.workspaceFolders.map(({ uri }) => {
                return uri.path;
              })[0]
            : null
        );

      default:
        throw new Error(`Unable to handle message of type ${type}`);
    }
  }
}

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

export function getHtmlForWebview(extensionUri: vscode.Uri, sourceName: string, webview: vscode.Webview): string {
  // Get the local path to main script run in the webview, then convert it to a uri we can use in the webview.
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, `${sourceName}.js`));
  const stylesMainUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, `${sourceName}.css`));

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

function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  return text;
}
