import * as vscode from 'vscode';

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
