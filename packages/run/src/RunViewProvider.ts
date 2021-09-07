import { AbstractViewProvider } from '@carpo/common';
import * as vscode from 'vscode';

export class RunViewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpo.runView';
}
