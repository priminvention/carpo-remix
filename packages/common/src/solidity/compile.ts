import type { CompilerInput, CompilerOutput, Source } from 'solc';

import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import fs from 'fs-extra';
import path from 'path';

import { SolidityCompiler } from '.';

export async function compile(filenames: string[]): Promise<CompilerOutput> {
  const workspacePath = getWorkspacePath();

  if (!workspacePath) throw new Error('Not workspace');

  const config = getWorkspaceConfig(workspacePath);

  const sources: Source = {};

  for (const filename of filenames) {
    sources[filename] = {
      content: fs.readFileSync(path.resolve(workspacePath, config?.paths?.sources ?? '', filename)).toString()
    };
  }

  const input: CompilerInput = {
    language: 'Solidity',
    sources: sources,
    settings: {
      outputSelection: config?.solidity?.settings?.outputSelection ?? {
        '*': {
          '': ['ast'],
          '*': [
            'abi',
            'metadata',
            'devdoc',
            'userdoc',
            'evm.legacyAssembly',
            'evm.bytecode',
            'evm.deployedBytecode',
            'evm.methodIdentifiers',
            'evm.gasEstimates',
            'evm.assembly'
          ]
        }
      },
      optimizer: {
        enabled: config?.solidity?.settings?.optimizer?.enabled ?? false,
        runs: config?.solidity?.settings?.optimizer?.runs ?? 200
      }
    }
  };

  const compiler = new SolidityCompiler(workspacePath, [config?.paths?.sources ?? 'contracts', 'node_modules']);

  const output = await compiler.compile(input);

  return output;
}
