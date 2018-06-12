import { isReactNative } from './utils';

// React polyfill for some next-level unstable optimizations
let ReactRenderer;
if (!!isReactNative) {
  ReactRenderer = require('react-native');
} else {
  ReactRenderer = require('react-dom');
}

let { unstable_batchedUpdates } = ReactRenderer;
if (unstable_batchedUpdates === undefined) {
  unstable_batchedUpdates = (fn: any) => fn();
}

export const batchUpdate = unstable_batchedUpdates;
