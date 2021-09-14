import { AbstractViewProvider } from '@carpo/common';
import * as vscode from 'vscode';

export class CompileViewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpoRedspot.compileView';
}
