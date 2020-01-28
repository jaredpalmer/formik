import { isReactNative } from './utils';

// React polyfill for unstable_batchedUpdates ba
// tl;dr, it's not that unstable, according to Dan Abramov,
// "Half of Facebook depends on this, and it's the most stable of the 'unstable' APIs."
// @see https://github.com/facebook/react/issues/14259#issuecomment-505918440
type Batch = (fn: () => void) => void;

let renderer: { unstable_batchedUpdates?: Batch } = {};

if (isReactNative) {
  renderer = require('react-native');
} else {
  try {
    renderer = require('react-dom');
  } catch (_error) {}
}

const { unstable_batchedUpdates = (fn: () => void) => fn() } = renderer;

export const batch = unstable_batchedUpdates;
