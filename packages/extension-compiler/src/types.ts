import { CompilerContext } from './ctx';

export interface Disposed {
  dispose(): any;
}

export type InterfaceEvents = {
  ready: CompilerContext;
};
