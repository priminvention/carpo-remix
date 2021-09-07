import { AbstractViewProvider } from '@carpo/common';
import * as vscode from 'vscode';

export class TestViewProvider extends AbstractViewProvider {
  public static readonly viewType = 'carpo.testView';
}
