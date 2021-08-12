// Borrowed from React-Redux, License MIT.
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/src/utils/reactBatchedUpdates.native.ts
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/LICENSE.md
//
// The Native compiler will detect this file with a .native suffix, and inject it in place of batch.ts.
//
import { unstable_batchedUpdates } from 'react-native'

export { unstable_batchedUpdates }
