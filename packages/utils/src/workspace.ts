import { workspace } from 'vscode';

export class NoWorkspaceError extends Error {
  constructor() {
    super('Has not workspace, please open an project');
  }
}

export function getWorkspacePath(): string {
  if (!workspace.workspaceFolders || workspace.workspaceFolders.length === 0) {
    throw new NoWorkspaceError();
  }

  /**
   * @todo support multiple workspace
   */
  return workspace.workspaceFolders.map(({ uri }) => {
    return uri.path;
  })[0];
}
