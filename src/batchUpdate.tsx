import { isReactNative } from './utils';

let ReactRenderer;

// React polyfill for some unstable shit..
if (!!isReactNative) {
  ReactRenderer = require('react-native');
} else {
  ReactRenderer = require('react-dom');
}

let { unstable_batchedUpdates } = ReactRenderer;
if (unstable_batchedUpdates === undefined) {
  unstable_batchedUpdates = (fn: (() => void)) => fn();
}

export const batchUpdate = unstable_batchedUpdates;
