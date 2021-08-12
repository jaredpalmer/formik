export * from './exports';

// Borrowed from React-Redux, License MIT
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/src/alternate-renderers.ts
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/LICENSE.md
import { batch } from './helpers/batch';
import { setBatch } from './helpers/batch-helpers';

// For the normal entrypoint, we will set batch to either React or React-Native unstable_batchedUpdates
// Devs using other renderers should import './alternate-renderers'; which doesn't use any optimizations.
setBatch(batch);
