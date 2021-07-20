import type { StatusBarItem } from 'vscode';

import { Workspace } from './Workspace';

async function install(workspace: Workspace): Promise<void> {
  if (workspace.isRedspotProject) {
    await workspace.doInstall();
  }
}

export async function init(workspace: Workspace, statusBar: StatusBarItem): Promise<void> {
  statusBar.text = 'Redspot: Installing';
  statusBar.show();

  await install(workspace);

  statusBar.text = `Redspot: ${workspace.redspotVersion}`;
}
