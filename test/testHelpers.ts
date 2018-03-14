/**
 * Copyright 2017 Jared Palmer. All rights reserved.
 */
// tslint:disable-next-line:no-empty
export const noop = () => {};

export const sleep = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));
