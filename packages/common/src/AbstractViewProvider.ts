import type {
  MessageTypes,
  RequestTypes,
  ResponseTypes,
  TransportRequestMessage,
  TransportResponseMessage,
  TransportSubscriptionMessage
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
    await this._ctx.isReady;

    switch (type) {
      case 'workspace.path':
        return this._ctx.basePath;

      case 'redspot.getConfig':
        return this._ctx.redspotConfig;

      case 'redspot.setConfig':
        this._ctx.setRedspotConfig(request as RequestTypes['redspot.setConfig']);

        return request as ResponseTypes['redspot.setConfig'];

      case 'redspot.compile':
        await this._ctx.compile();

        return null;

      case 'redspot.subConfig':
        this._ctx.on('redspot.config.change', (redspotConfig) => {
          this._view?.webview
            .postMessage({
              id,
              subscription: redspotConfig
            } as TransportSubscriptionMessage<'redspot.subConfig'>)
            .then((a) => a, console.error);
        });

        return this._ctx.redspotConfig;

      case 'redspot.getScripts':
        return this._ctx.getScriptFiles();

      case 'redspot.subScripts':
        this._ctx.on('redspot.script.change', (scripts) => {
          this._view?.webview
            .postMessage({
              id,
              subscription: scripts
            } as TransportSubscriptionMessage<'redspot.subScripts'>)
            .then((a) => a, console.error);
        });

        return this._ctx.getScriptFiles();

      case 'redspot.getTestFiles':
        return this._ctx.getTestFiles();

      case 'redspot.subTestFiles':
        this._ctx.on('redspot.test.change', (tests) => {
          this._view?.webview
            .postMessage({
              id,
              subscription: tests
            } as TransportSubscriptionMessage<'redspot.subTestFiles'>)
            .then((a) => a, console.error);
        });

        return this._ctx.getTestFiles();

      case 'redspot.run':
        await this._ctx.run(request as RequestTypes['redspot.run']);

        return null;

      case 'redspot.test':
        await this._ctx.test(
          (request as RequestTypes['redspot.test']).filePath,
          (request as RequestTypes['redspot.test']).noCompile
        );

        return null;

      case 'redspot.getArtifacts':
        return this._ctx.getArtifacts();

      case 'redspot.subArtifacts':
        this._ctx.on('redspot.artifacts.change', (artifacts) => {
          this._view?.webview
            .postMessage({
              id,
              subscription: artifacts
            } as TransportSubscriptionMessage<'redspot.subTestFiles'>)
            .then((a) => a, console.error);
        });

        return this._ctx.getArtifacts();

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
