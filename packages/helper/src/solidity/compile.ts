import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import fs from 'fs-extra';
import path from 'path';
import { CompilerInput } from 'solc';

import { SolidityCompiler } from '.';

export async function compile(filename: string): Promise<any> {
  const config = getWorkspaceConfig(process.cwd());
  const input: CompilerInput = {
    language: 'Solidity',
    sources: {
      [filename]: {
        content: fs.readFileSync(path.resolve(process.cwd(), filename)).toString()
      }
    },
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

  const compiler = new SolidityCompiler(process.cwd(), [config?.paths?.sources ?? 'contracts', 'node_modules']);

  const output = compiler.compile(input);

  console.log(output);

  return output;
}
