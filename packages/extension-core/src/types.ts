import type { Artifact } from '@carpo-remix/common/solidity';
import type { CoreContext } from './ctx';

export type InterfaceEvents = {
  ready: CoreContext;
};

export interface ScriptArgs {
  getArtifacts(): Promise<Artifact[]>;
  getNamedArtifact(name: string): Promise<Artifact | null>;
}
