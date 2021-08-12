// practically https://github.com/reduxjs/react-redux/blob/master/src/utils/batch.ts
export type BatchCallback = () => void;
export type BatchFn = (callback: BatchCallback) => void;

const noopBatch: BatchFn = (callback) => callback();
let batch = noopBatch;

export const setBatch = (fn: BatchFn) => {
    batch = fn;
}

export const getBatch = () => batch;
