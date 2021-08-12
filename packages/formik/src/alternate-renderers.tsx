// Borrowed from React-Redux, License MIT
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/src/alternate-renderers.ts
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/LICENSE.md
//
// For renderers other than React-Dom or React-Native, we cannot set a batch function.
// You can update the batch fn by using setBatch() if your renderer provides an alternative to unstable_batchedUpdates.
//
export * from './exports';
