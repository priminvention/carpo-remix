import { CoreContext } from './ctx';

export interface Disposed {
  dispose(): any;
}

export type InterfaceEvents = {
  ready: CoreContext;
};
