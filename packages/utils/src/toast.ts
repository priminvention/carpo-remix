/* eslint-disable @typescript-eslint/no-floating-promises */
import { window } from 'vscode';

export function info(message: string, ...items: string[]): void {
  window.showInformationMessage(message, ...items);
}

export function error(message: string, ...items: string[]): void {
  window.showErrorMessage(message, ...items);
}
