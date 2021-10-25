import type { ChildProcess } from 'child_process';

export function processPromise(child: ChildProcess, output?: (msg: string) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    child.stdout?.on('data', (data) => {
      output?.(data);
    });

    child.stderr?.on('data', (data) => {
      output?.(data);
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`child exit with code: ${code}`));
      }
    });
  });
}
