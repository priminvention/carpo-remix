/* eslint-disable @typescript-eslint/no-unsafe-call */
import type { CompilerInput, CompilerOutput } from 'solc';
import type solc from 'solc';

import fs from 'fs-extra';
import path from 'path';

function findImports(filename: string, root: string, includes: string[]) {
  let contents: string | null = null;

  for (const include of ['', ...includes]) {
    if (fs.existsSync(path.resolve(root, include, filename))) {
      contents = fs.readFileSync(path.resolve(root, include, filename)).toString();
      break;
    }
  }

  if (contents) {
    return { contents };
  } else {
    return { error: 'File not found' };
  }
}

export class SolidityCompiler {
  #basePath: string;
  #includes: string[];
  #loadedSolc?: typeof solc;

  constructor(basePath: string, includes: string[]) {
    this.#basePath = basePath;
    this.#includes = includes;
  }

  public async getSolc(workspace?: string | null): Promise<typeof solc> {
    if (this.#loadedSolc) return this.#loadedSolc;

    try {
      if (workspace) {
        // eslint-disable-next-line no-eval
        return (this.#loadedSolc = eval('require')(path.resolve(workspace, 'node_modules', 'solc')));
      } else {
        return (this.#loadedSolc = await import('solc'));
      }
    } catch (error) {
      return (this.#loadedSolc = await import('solc'));
    }
  }

  public async compile(input: CompilerInput): Promise<CompilerOutput> {
    const solc = await this.getSolc();

    const jsonOutput = solc.compile(JSON.stringify(input), {
      import: (path) => findImports(path, this.#basePath, this.#includes)
    });

    return JSON.parse(jsonOutput);
  }
}
