import superagent from 'superagent';

export const versionListUrl = 'https://solc-bin.ethereum.org/bin/list.json';

export async function getSolidityReleases(): Promise<Record<string, string>> {
  const data = await (await superagent.get(versionListUrl)).body;

  return data.releases;
}

export * from './SolidityCompiler';
export * from './compile';
