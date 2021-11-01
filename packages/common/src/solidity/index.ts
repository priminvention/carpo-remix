import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { getWorkspacePath, NoWorkspaceError } from '@carpo-remix/utils/workspace';
import globby from 'globby';
import superagent from 'superagent';

export const versionListUrl = 'https://solc-bin.ethereum.org/bin/list.json';

export async function getSolidityReleases(): Promise<Record<string, string>> {
  const data = await (await superagent.get(versionListUrl)).body;

  return data.releases;
}

export function findContracts(): Promise<string[]> {
  const workspacePath = getWorkspacePath();

  if (!workspacePath) return Promise.reject(new NoWorkspaceError());

  const config = getWorkspaceConfig(workspacePath);

  return globby(config?.paths?.sources ?? 'contracts', {
    expandDirectories: {
      extensions: ['sol']
    },
    cwd: workspacePath,
    onlyFiles: true,
    gitignore: true
  });
}

export * from './SolidityCompiler';
export * from './compile';
