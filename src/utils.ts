/**
 * Returns whether something is a Promise or not.
 * @param value anything
 * 
 * @see https://github.com/pburtchaell/redux-promise-middleware/blob/master/src/isPromise.js
 */
export function isPromise(value: any): boolean {
  if (value !== null && typeof value === 'object') {
    return value && typeof value.then === 'function';
  }

  return false;
}

/**
 * True if running in React Native. 
 */
export const isReactNative =
  typeof window !== 'undefined' &&
  window.navigator &&
  window.navigator.product &&
  window.navigator.product === 'ReactNative';

/**
 * Returns values object in a new array
 * @param obj any object
 */
export function values<T>(obj: any): T[] {
  const vals = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
}
