import { ImportsFsEngine } from '@resolver-engine/imports-fs';
import parser from '@solidity-parser/parser';
import fs from 'fs-extra';
import path from 'path';
import tsort from 'tsort';

const IMPORT_SOLIDITY_REGEX = /^\s*import(\s+).*$/gm;

function unique(array: string[]): string[] {
  return [...new Set(array)];
}

async function resolve(importPath: string) {
  const resolver = ImportsFsEngine();
  const filePath = await resolver.resolve(importPath);
  const fileContents = fs.readFileSync(filePath).toString();

  return { fileContents, filePath };
}

function getDirPath(filePath: string): string {
  const index1 = filePath.lastIndexOf(path.sep);
  const index2 = filePath.lastIndexOf('/');

  return filePath.substring(0, Math.max(index1, index2));
}

function getDependencies(filePath: string, fileContents: string) {
  try {
    const ast = parser.parse(fileContents);
    const imports: any[] = [];

    parser.visit(ast, {
      ImportDirective: function (node) {
        imports.push(getNormalizedDependencyPath(node.path, filePath));
      }
    });

    return imports;
  } catch (error) {
    throw new Error(`Could not parse ${filePath} for extracting its imports: ${error}`);
  }
}

function getNormalizedDependencyPath(dependency: string, filePath: string) {
  if (dependency.startsWith('./') || dependency.startsWith('../')) {
    dependency = path.join(getDirPath(filePath), dependency);
    dependency = path.normalize(dependency);
  }

  return dependency.replace(/\\/g, '/');
}

async function dependenciesDfs(graph: { add: (arg0: any, arg1: any) => void }, visitedFiles: any[], filePath: string) {
  visitedFiles.push(filePath);

  const resolved = await resolve(filePath);

  const dependencies = getDependencies(resolved.filePath, resolved.fileContents);

  for (const dependency of dependencies) {
    graph.add(dependency, filePath);

    if (!visitedFiles.includes(dependency)) {
      await dependenciesDfs(graph, visitedFiles, dependency);
    }
  }
}

async function getSortedFilePaths(entryPoints: string[], projectRoot: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const graph = tsort();
  const visitedFiles: any[] = [];

  for (const entryPoint of entryPoints) {
    await dependenciesDfs(graph, visitedFiles, entryPoint);
  }

  let topologicalSortedFiles;

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    topologicalSortedFiles = graph.sort();
  } catch (e: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    if (e.toString().includes('Error: There is a cycle in the graph.')) {
      const message =
        'There is a cycle in the dependency' +
        " graph, can't compute topological ordering. Files:\n\t" +
        visitedFiles.join('\n\t');

      throw new Error(message);
    }
  }

  // If an entry has no dependency it won't be included in the graph, so we
  // add them and then dedup the array
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const withEntries = topologicalSortedFiles.concat(entryPoints).map((f: any) => fileNameToGlobalName(f, projectRoot));

  const files = unique(withEntries);

  return files;
}

async function fileContentWithoutImports(filePath: string) {
  const resolved = await resolve(filePath);
  const output = resolved.fileContents.replace(IMPORT_SOLIDITY_REGEX, '');

  // normalize whitespace to a single trailing newline
  return output.trim() + '\n';
}

function fileNameToGlobalName(fileName: string, projectRoot: string) {
  let globalName = getFilePathsFromProjectRoot([fileName], projectRoot)[0];

  if (globalName.indexOf('node_modules/') !== -1) {
    globalName = globalName.substr(globalName.indexOf('node_modules/') + 'node_modules/'.length);
  }

  return globalName;
}

async function printContactenation(files: string[]) {
  const parts = await Promise.all(
    files.map(async (file) => {
      return '// File: ' + file + '\n\n' + (await fileContentWithoutImports(file));
    })
  );

  return parts.join('\n');
}

function getFilePathsFromProjectRoot(filePaths: string[], projectRoot: string): string[] {
  return filePaths.map((f) => path.relative(projectRoot, path.resolve(f)));
}

export default async function flatten(filePaths: string[], root: string): Promise<string> {
  if (root && !fs.existsSync(root)) {
    throw new Error('The specified root directory does not exist');
  }

  const projectRoot = root;
  const filePathsFromProjectRoot = getFilePathsFromProjectRoot(filePaths, projectRoot);

  const sortedFiles = await getSortedFilePaths(filePathsFromProjectRoot, projectRoot);

  return await printContactenation(sortedFiles);
}
