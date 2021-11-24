import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import globby from 'globby';
import superagent from 'superagent';

export const versionListUrl = 'https://solc-bin.ethereum.org/bin/list.json';

export async function getSolidityReleases(): Promise<Record<string, string>> {
  const data = await (await superagent.get(versionListUrl)).body;

  return data.releases;
}

export function findContracts(workspacePath: string): Promise<string[]> {
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
