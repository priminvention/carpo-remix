/* eslint-disable no-eval */
/* eslint-disable @typescript-eslint/no-unsafe-call */

export function importTs(path: string): { default: any } & Record<string, any> {
  eval('require')('ts-node').register();

  return eval('require')(path);
}

export function importTsDefault<T>(path: string): T {
  const func = importTs(path).default;

  return func;
}
