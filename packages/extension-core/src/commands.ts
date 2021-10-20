import type { ProjectConfig } from '@carpo-remix/config/types';

import { AbstractCommands } from '@carpo-remix/common/AbstractCommands';

export type CoreCommandSignatures = {
  'carpo-core.openQuickPick': [undefined, void];
  'carpo-core.genConfig': [ProjectConfig, ProjectConfig | undefined];
  'carpo-core.createProject': [undefined, void];
};

export class CoreCommands extends AbstractCommands<CoreCommandSignatures> {}
