export * from './exports';

// Borrowed from React-Redux, License MIT.
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/src/utils/reactBatchedUpdates.native.ts
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/LICENSE.md
//
// The Native compiler will detect this file with a .native suffix, and inject it in place of batch.ts.
//
import { unstable_batchedUpdates } from 'react-native';
import { setBatch } from './helpers/batch-helpers';

// For the normal entrypoint, we will set batch to either React or React-Native unstable_batchedUpdates
// Devs using other renderers should import './index.alternate.js'; which doesn't use any optimizations.
setBatch(unstable_batchedUpdates);
