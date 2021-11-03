import type { WorkspaceConfig } from '@carpo-remix/config/types';

import { AbstractCommands } from '@carpo-remix/common';

export type CoreCommandSignatures = {
  'carpo-core.openQuickPick': [undefined, void];
  'carpo-core.genConfig': [WorkspaceConfig, WorkspaceConfig | undefined];
  'carpo-core.createProject': [undefined, void];
  'carpo-core.runDevNode': [undefined, void];
};

export class CoreCommands extends AbstractCommands<CoreCommandSignatures> {}
