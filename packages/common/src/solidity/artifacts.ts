import type { CompilerOutput } from 'solc';

import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { ProjectConfig } from '@carpo-remix/config/types';
import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';

export type Artifact = {
  contractName: string;
  sourceName: string;
  abi: any;
  bytecode: string;
  deployedBytecode: string;
};

export function writeArtifacts(output: CompilerOutput, workspacePath: string, config?: ProjectConfig | null): void {
  const artifactsDir = path.resolve(workspacePath, config?.paths?.artifacts ?? 'artifacts');

  fs.ensureDirSync(artifactsDir);

  Object.keys(output.contracts).forEach((key) => {
    Object.keys(output.contracts[key]).forEach((contractName) => {
      const contractPath = path.resolve(artifactsDir, key, contractName + '.json');

      const data = output.contracts[key][contractName];

      fs.ensureFileSync(contractPath);

      const artifact: Artifact = {
        contractName,
        sourceName: key,
        abi: data.abi,
        bytecode: data.evm.bytecode,
        deployedBytecode: data.evm.deployedBytecode
      };

      fs.writeJsonSync(contractPath, artifact, {
        spaces: 2
      });
    });
  });
}

export async function getArtifacts(workspacePath?: string | null): Promise<Artifact[]> {
  if (!workspacePath) return [];

  const config = getWorkspaceConfig(workspacePath);

  const files = await globby(config?.paths?.artifacts ?? 'artifacts', {
    expandDirectories: {
      extensions: ['json']
    },
    cwd: workspacePath,
    onlyFiles: true
  });

  return files.map((file) => {
    return fs.readJSONSync(path.resolve(workspacePath, file));
  });
}
