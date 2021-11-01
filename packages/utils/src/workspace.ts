import { workspace } from 'vscode';

export class NoWorkspaceError extends Error {
  constructor() {
    super('Has not workspace, please open an project');
  }
}

export function getWorkspacePath(): string | null {
  return workspace.workspaceFolders && workspace.workspaceFolders.length > 0
    ? workspace.workspaceFolders.map(({ uri }) => {
        return uri.path;
      })[0]
    : null;
}
