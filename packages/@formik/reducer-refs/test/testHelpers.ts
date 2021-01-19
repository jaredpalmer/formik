// tslint:disable-next-line:no-empty
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
