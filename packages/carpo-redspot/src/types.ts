import type { RedspotConfig } from 'redspot/types/config';

import * as vscode from 'vscode';

import { CarpoContext } from './ctx';

export interface Disposed {
  dispose(): any;
}

export type InterfaceEvents = {
  installed: null;
  ready: CarpoContext;
  'redspot.config.change': RedspotConfig;
  'redspot.script.change': vscode.Uri[];
};

export type InterfaceEventType = keyof InterfaceEvents;
