import parser from '@solidity-parser/parser';
import fs from 'fs-extra';
import path from 'path';

const IMPORT_SOLIDITY_REGEX = /^\s*import(\s+).*$/gm;

function unique(array: string[]): string[] {
  return [...new Set(array)];
}

function findImport(importPath: string, projectRoot: string) {
  if (path.isAbsolute(importPath)) {
    return importPath;
  } else if (fs.existsSync(path.resolve(projectRoot, importPath))) {
    return path.resolve(projectRoot, importPath);
  } else if (fs.existsSync(path.resolve(projectRoot, 'node_modules', importPath))) {
    return path.resolve(projectRoot, 'node_modules', importPath);
  } else {
    throw new Error(`Not found importPath ${importPath}`);
  }
}

function resolve(importPath: string, projectRoot: string) {
  const filePath: string = findImport(importPath, projectRoot);

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
    const ast = parser.parse(fileContents, {});
    const imports: string[] = [];

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

async function dependenciesDfs(graph: string[], filePath: string, projectRoot: string) {
  const resolved = resolve(filePath, projectRoot);

  const dependencies = getDependencies(resolved.filePath, resolved.fileContents);

  if (dependencies.length !== 0) {
    for (const dependency of dependencies) {
      await dependenciesDfs(graph, dependency, projectRoot);
    }
  }

  graph.push(filePath);
}

async function getSortedFilePaths(entryPoint: string, projectRoot: string): Promise<string[]> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const graph: string[] = [];

  await dependenciesDfs(graph, entryPoint, projectRoot);

  // If an entry has no dependency it won't be included in the graph, so we
  // add them and then dedup the array
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const withEntries = graph.concat(entryPoint).map((filePath) => {
    if (path.isAbsolute(filePath)) {
      filePath = path.relative(projectRoot, filePath);
    }

    if (filePath.includes('node_modules/')) {
      filePath = filePath.substr(filePath.indexOf('node_modules/') + 'node_modules/'.length);
    }

    return filePath;
  });

  const files = unique(withEntries);

  return files;
}

function fileContentWithoutImports(filePath: string, projectRoot: string) {
  const resolved = resolve(filePath, projectRoot);
  const output = resolved.fileContents.replace(IMPORT_SOLIDITY_REGEX, '');

  // normalize whitespace to a single trailing newline
  return output.trim() + '\n';
}

function printContactenation(files: string[], projectRoot: string) {
  const parts = files.map((file) => {
    return '// File: ' + file + '\n\n' + fileContentWithoutImports(file, projectRoot);
  });

  return parts.join('\n');
}

export default async function flatten(filePath: string, projectRoot: string): Promise<string> {
  if (projectRoot && !fs.existsSync(projectRoot)) {
    throw new Error('The specified root directory does not exist');
  }

  const sortedFiles = await getSortedFilePaths(filePath, projectRoot);

  return printContactenation(sortedFiles, projectRoot);
}
