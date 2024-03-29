import type { WorkspaceConfig } from '@carpo-remix/config/types';
import type { Artifact, CompilerOutput } from './types';

import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import fs from 'fs-extra';
import globby from 'globby';
import path from 'path';

export function writeArtifacts(output: CompilerOutput, workspacePath: string, config?: WorkspaceConfig | null): void {
  if (!output.contracts) return;

  const artifactsDir = path.resolve(workspacePath, config?.paths?.artifacts ?? 'artifacts');

  fs.ensureDirSync(artifactsDir);

  for (const key in output.contracts) {
    for (const contractName in output.contracts[key]) {
      const contractPath = path.resolve(artifactsDir, key, contractName + '.json');

      const data = output.contracts[key][contractName];

      fs.ensureFileSync(contractPath);

      const artifact: Artifact = {
        contractName,
        sourceName: key,
        abi: data.abi,
        bytecode: data.evm.bytecode.object,
        deployedBytecode: data.evm.deployedBytecode.object
      };

      fs.writeJsonSync(contractPath, artifact, {
        spaces: 2
      });
    }
  }
}

export async function getArtifacts(workspacePath: string = process.cwd()): Promise<Artifact[]> {
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

export async function getNamedArtifact(name: string, workspacePath: string = process.cwd()): Promise<Artifact | null> {
  const config = getWorkspaceConfig(workspacePath);

  const files = await globby(config?.paths?.artifacts ?? 'artifacts', {
    expandDirectories: {
      files: [name],
      extensions: ['json']
    },
    cwd: workspacePath,
    onlyFiles: true
  });

  if (files.length === 0) return null;

  return fs.readJSONSync(path.resolve(workspacePath, files[0]));
}
