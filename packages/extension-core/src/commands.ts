import type { Disposed } from '@carpo-remix/common/types';
import type { ProjectConfig } from '@carpo-remix/config/types';
import type { Disposable } from 'vscode';

import { registerCommand } from '@carpo-remix/common/commands';
import { defaultConfigName } from '@carpo-remix/config';
import fs from 'fs-extra';
import path from 'path';

export class Commands implements Disposed {
  #commands: Disposable[];

  constructor(workspace: string) {
    this.#commands = [
      registerCommand('carpo-core.genConfig', (arg: ProjectConfig) => {
        fs.writeJsonSync(path.resolve(workspace, defaultConfigName), arg, {
          spaces: 2
        });

        return arg;
      })
    ];
  }

  public dispose(): void {
    this.#commands.forEach((command) => command.dispose());
  }
}
