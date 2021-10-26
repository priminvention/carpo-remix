import type { TaskDefinition } from 'vscode';

import { ShellExecution, TaskScope } from 'vscode';

import { AbstractTask } from './AbstractTask';

interface NpmTaskDefinition extends TaskDefinition {
  script: string;
}

function getTaskDefinition(script: string): NpmTaskDefinition {
  return {
    type: 'npm',
    script
  };
}

export class NpmTask extends AbstractTask {
  constructor(name: string, command: string) {
    super(getTaskDefinition(command), TaskScope.Workspace, name, 'Carpo', new ShellExecution(command));
  }
}
