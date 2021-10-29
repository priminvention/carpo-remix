import fs from 'fs-extra';
import path from 'path';
import { CompilerInput } from 'solc';

import { SolidityCompiler } from './SolidityCompiler';

describe('SolidityCompiler', (): void => {
  it('compile', async (): Promise<void> => {
    const compiler = new SolidityCompiler(path.resolve(), ['contracts', 'node_modules']);

    const input: CompilerInput = {
      language: 'Solidity',
      sources: {
        'UniswapV3Pool.sol': {
          content: fs.readFileSync(path.resolve('contracts', 'UniswapV3Pool.sol')).toString()
        }
      },
      settings: {
        outputSelection: {
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
        }
      }
    };

    const output = await compiler.compile(input).catch(console.error);

    console.log(output);
  });
});
