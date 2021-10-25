import { workspace } from 'vscode';

export function getWorkspacePath(): string | null {
  return workspace.workspaceFolders && workspace.workspaceFolders.length > 0
    ? workspace.workspaceFolders.map(({ uri }) => {
        return uri.path;
      })[0]
    : null;
}
