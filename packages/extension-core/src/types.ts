import type { Artifact } from '@carpo-remix/helper/types';
import type { CoreContext } from './ctx';

export type InterfaceEvents = {
  ready: CoreContext;
};

export interface ScriptArgs {
  getArtifacts(): Promise<Artifact[]>;
  getNamedArtifact(name: string): Promise<Artifact | null>;
}
