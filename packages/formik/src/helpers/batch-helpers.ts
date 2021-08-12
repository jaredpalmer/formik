// Borrowed from React-Redux, License MIT.
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/src/utils/batch.ts
// https://github.com/reduxjs/react-redux/blob/d4e4eba9ccbd488b103b3c5625a37e15b1427d11/LICENSE.md
//
export type BatchCallback = () => void;
export type BatchFn = (callback: BatchCallback) => void;

const noopBatch: BatchFn = (callback) => callback();
let batch = noopBatch;

export const setBatch = (fn: BatchFn) => {
    batch = fn;
}

export const getBatch = () => batch;
