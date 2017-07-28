/** @private is the given object/value a promise? */
export function isPromise(value: any): boolean {
  if (value !== null && typeof value === 'object') {
    return value && typeof value.then === 'function';
  }

  return false;
}

/** @private is running React Native?  */
export const isReactNative =
  typeof window !== 'undefined' &&
  window.navigator &&
  window.navigator.product &&
  window.navigator.product === 'ReactNative';

/** @private Returns values of an object in a new array */
export function values<T>(obj: any): T[] {
  const vals = [];
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      vals.push(obj[key]);
    }
  }
  return vals;
}

/** @private is the given object a Function? */
export const isFunction = (obj: any) => 'function' === typeof obj;
