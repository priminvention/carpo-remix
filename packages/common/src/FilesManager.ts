import type { GlobPattern, Uri } from 'vscode';
import type { Disposed } from './types';

import { Events } from '@carpo-remix/helper';
import * as vscode from 'vscode';

interface FilesManagerEvents {
  change: string;
  create: string;
  delete: string;
}

export abstract class FilesManager extends Events<FilesManagerEvents, keyof FilesManagerEvents> implements Disposed {
  #watcher: vscode.FileSystemWatcher;
  #globPattern: GlobPattern;
  public files: string[] = [];

  constructor(globPattern: GlobPattern) {
    super();

    this.#globPattern = globPattern;
    this.#watcher = this.createWatcher(globPattern);
  }

  protected createWatcher(globPattern: GlobPattern): vscode.FileSystemWatcher {
    if (this.#watcher) {
      this.#watcher.dispose();
    }

    this.#watcher = vscode.workspace.createFileSystemWatcher(globPattern, false, false, false);

    this.#watcher.onDidCreate(this.onDidCreate.bind(this));
    this.#watcher.onDidChange(this.onDidChange.bind(this));
    this.#watcher.onDidDelete(this.onDidDelete.bind(this));

    return this.#watcher;
  }

  protected async onDidCreate(uri: Uri): Promise<void> {
    this.files = await this.getFiles();
    this.emit('create', uri.path);
  }

  protected async onDidChange(uri: Uri): Promise<void> {
    this.files = await this.getFiles();
    this.emit('change', uri.path);
  }

  protected async onDidDelete(uri: Uri): Promise<void> {
    this.files = await this.getFiles();
    this.emit('delete', uri.path);
  }

  public async getFiles(): Promise<string[]> {
    return (await vscode.workspace.findFiles(this.#globPattern)).map((uri) => uri.path);
  }

  public dispose(): void {
    this.#watcher.dispose();
  }
}
