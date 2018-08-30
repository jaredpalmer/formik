// tslint:disable-next-line:no-empty
export const noop = () => {};

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

export const getYupFakeSchema = () => ({
  validate: jest.fn(() => Promise.resolve({})),
  cast: jest.fn((foo: object) => foo),
});
