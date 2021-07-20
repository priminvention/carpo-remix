import type { OutputChannel, StatusBarItem } from 'vscode';

export class VscodeBase {
  protected output: OutputChannel;
  protected status: StatusBarItem;

  constructor(output: OutputChannel, status: StatusBarItem) {
    this.output = output;
    this.status = status;
  }

  public print(value: string | Buffer | { toString: () => string }): void {
    this.output.append(value.toString());
  }

  public println(value: string | Buffer | { toString: () => string }): void {
    this.output.appendLine(value.toString());
  }
}
