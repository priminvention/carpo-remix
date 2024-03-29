import type { TaskExecution } from 'vscode';

import { Task, tasks } from 'vscode';

export abstract class AbstractTask extends Task {
  protected taskExcution: TaskExecution | null = null;

  public execute(): Promise<TaskExecution> {
    return new Promise((resolve, reject) => {
      tasks.executeTask(this).then((_execution) => {
        this.taskExcution = _execution;
        tasks.onDidEndTask((e) => {
          if (e.execution === _execution) {
            resolve(e.execution);
            _execution.terminate();
          }
        });
      }, reject);
    });
  }

  public terminate(): void {
    if (!this.taskExcution) {
      throw new Error(`${this.name} task is not running`);
    }

    this.taskExcution.terminate();
  }
}
