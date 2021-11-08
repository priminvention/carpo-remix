import { CustomExecution, EventEmitter, Pseudoterminal, TaskDefinition, TaskScope } from 'vscode';

import { AbstractTask } from '.';

interface FunctionalTaskDefinition extends TaskDefinition {
  name: string;
}

export class FunctionalTask extends AbstractTask {
  private writeEmitter = new EventEmitter<string>();

  constructor(name: string, cb: (writeEmitter: EventEmitter<any>) => Promise<void>) {
    super(
      {
        type: 'functional',
        name
      } as FunctionalTaskDefinition,
      TaskScope.Workspace,
      name,
      'Carpo',
      new CustomExecution((resolvedDefinition: TaskDefinition): Promise<Pseudoterminal> => {
        let done = false;

        return new Promise((resolve) =>
          resolve({
            onDidWrite: this.writeEmitter.event,
            open: async () => {
              this.writeEmitter.fire(`${resolvedDefinition.name} task\n`);

              try {
                await cb(this.writeEmitter);
                this.writeEmitter.fire(`\r\x1b[32mSuccess: ${resolvedDefinition.name}\x1b[0m\n`);
              } catch (error) {
                this.writeEmitter.fire(`\r\x1b[31mFailed: ${resolvedDefinition.name}\x1b[0m\n`);
              }

              this.writeEmitter.fire(`\rPress any key to close.\n`);
              done = true;
            },
            close: () => {
              this.writeEmitter.dispose();
            },
            handleInput: () => {
              if (done) {
                this.terminate();
              }
            }
          })
        );
      })
    );
  }
}
