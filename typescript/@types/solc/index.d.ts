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

  export interface CompilerOutputError {
    // Optional: Location within the source file.
    sourceLocation: {
      file: string;
      start: number;
      end: number;
    };
    // Optional: Further locations (e.g. places of conflicting declarations)
    secondarySourceLocations?: {
      file: string;
      start: number;
      end: number;
      message: string;
    }[];
    // Mandatory: Error type, such as "TypeError", "InternalCompilerError", "Exception", etc.
    // See below for complete list of types.
    type: string;
    // Mandatory: Component where the error originated, such as "general", "ewasm", etc.
    component: string;
    // Mandatory ("error", "warning" or "info", but please note that this may be extended in the future)
    severity: 'error' | 'warning' | 'info';
    // Optional: unique code for the cause of the error
    errorCode: string;
    // Mandatory
    message: string;
    // Optional: the message formatted with source location
    formattedMessage: string;
  }

  export interface CompilerOutput {
    errors?: CompilerOutputError[];
    // This contains the file-level outputs.
    // It can be limited/filtered by the outputSelection settings.
    sources: Record<
      string,
      {
        // Identifier of the source (used in source maps)
        id: string;
        // The AST object
        ast: any;
      }
    >;
    // This contains the contract-level outputs.
    // It can be limited/filtered by the outputSelection settings.
    contracts?: Record<
      string,
      Record<
        string,
        {
          // The Ethereum Contract ABI. If empty, it is represented as an empty array.
          // See https://docs.soliditylang.org/en/develop/abi-spec.html
          abi: any;
          // See the Metadata Output documentation (serialised JSON string)
          metadata: string;
          // User documentation (natspec)
          userdoc: any;
          // Developer documentation (natspec)
          devdoc: any;
          // EVM-related outputs
          evm: {
            // Assembly (string)
            assembly: string;
            // Old-style assembly (object)
            legacyAssembly: any;
            // Bytecode and related details.
            bytecode: any;
            deployedBytecode: any;
            // Function gas estimates
            gasEstimates: any;
          };
        }
      >
    >;
  }

  export interface CompilerOptions {
    import(path: string): { error: any } | { contents: string };
  }

  export function compile(input: string, options?: CompilerOptions): string;

  export function version(): string;
}
