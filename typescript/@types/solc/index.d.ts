declare module 'solc' {
  import type { CompilerOptions } from '@carpo-remix/helper/types';

  export function compile(input: string, options?: CompilerOptions): string;

  export function version(): string;
}
