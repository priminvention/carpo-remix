declare module 'solc' {
  type EVMVersion =
    | 'homestead'
    | 'tangerineWhistle'
    | 'spuriousDragon'
    | 'byzantium'
    | 'constantinople'
    | 'petersburg'
    | 'istanbul'
    | 'muirGlacier'
    | null;

  type Language = 'Solidity' | 'Yul';

  export interface Source {
    [fileName: string]: {
      // Optional: keccak256 hash of the source file
      keccak256?: string;
      // Required (unless "urls" is used): literal contents of the source file
      content: string;
      urls?: string[];
    };
  }

  export interface SoliditySettings {
    remappings?: string[];
    optimizer?: {
      enabled: boolean;
      runs: number;
      details?: {
        peephole?: boolean;
        jumpdestRemover?: boolean;
        orderLiterals?: boolean;
        deduplicate?: boolean;
        cse?: boolean;
        constantOptimizer?: boolean;
        yul?: boolean;
        yulDetails?: {
          stackAllocation: boolean;
        };
      };
    };
    evmVersion?: EVMVersion;
    debug?: {
      revertStrings: 'default' | 'strip' | 'debug' | 'verboseDebug';
    };
    metadata?: {
      useLiteralContent: boolean;
      bytecodeHash: 'ipfs' | 'bzzr1' | 'none';
    };
    libraries?: {
      [fileName: string]: Record<string, string>;
    };
    outputSelection?: {
      '*': {
        '': ['ast'];
        '*':
          | ['*']
          | [
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
            ];
      };
    };
  }

  export interface CompilerInput {
    language: Language;
    sources: Source;
    settings: SoliditySettings;
  }

  export interface CompilerOptions {
    import(path: string): { error: any } | { contents: string };
  }

  export function compile(input: string, options?: CompilerOptions): string;
}
