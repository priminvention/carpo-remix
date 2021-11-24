import type { CompilerInput, CompilerOutput, Source } from '@carpo-remix/helper/types';

import { getWorkspaceConfig } from '@carpo-remix/config/getWorkspaceConfig';
import { writeArtifacts } from '@carpo-remix/helper';
import { toast } from '@carpo-remix/utils';
import { getWorkspacePath } from '@carpo-remix/utils/workspace';
import fs from 'fs-extra';
import path from 'path';

import { getCoreApi } from '../getCoreApi';
import { SolidityCompiler } from '.';

export async function compile(filenames: string[]): Promise<CompilerOutput> {
  const workspacePath = getWorkspacePath();

  filenames = filenames.map((filename) =>
    path.isAbsolute(filename) ? path.relative(workspacePath, filename) : filename
  );

  const config = getWorkspaceConfig(workspacePath);

  const sources: Source = {};
  const coreApi = getCoreApi();

  for (const filename of filenames) {
    sources[filename] = {
      content: fs.readFileSync(path.resolve(workspacePath, filename)).toString()
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

  const compiler = new SolidityCompiler(workspacePath, ['node_modules']);

  const showName = filenames.length === 1 ? filenames[0] : `${filenames.length} files`;

  coreApi?.ctx.println('');
  coreApi?.ctx.println(`Compiling ${showName} with ${(await compiler.getSolc()).version()}`);
  const output = await compiler.compile(input);

  const success = !output.errors || output.errors.filter((error) => error.severity === 'error').length === 0;

  if (success) {
    output.errors?.forEach((error) => {
      coreApi?.ctx.println(`${error.type}: ${error.formattedMessage}`);
    });
    coreApi?.ctx.println(`Compilation ${showName} successfully`);
    toast.info(`Compilation ${showName} successfully`);
  } else {
    toast.error('Compilation failed');
    output.errors
      ?.filter((error) => error.severity === 'error')
      .forEach((error) => {
        coreApi?.ctx.println(`${error.type}: ${error.formattedMessage}`);
        toast.error(`${error.type}: ${error.message}`);
      });
  }

  writeArtifacts(output, workspacePath, config);

  return output;
}
