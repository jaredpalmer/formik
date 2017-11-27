import * as React from 'react';

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

/** 
 * @private Deeply get a value from an object via it's dot path. 
 * See https://github.com/developit/dlv/blob/master/index.js
 */
export function dlv(
  obj: any,
  key: string | string[],
  def?: any,
  p: number = 0
) {
  key = (key as string).split ? (key as string).split('.') : key;
  while (obj && p < key.length) {
    obj = obj[key[p++]];
  }
  return obj === undefined ? def : obj;
}

/** 
 * @private Deeply set a value from in object via it's dot path. 
 * See https://github.com/developit/linkstate
 */
export function setDeep(path: string, value: any, obj: any): any {
  let res: any = {};
  let resVal: any = res;
  let i = 0;
  let pathArray = path.replace(/\]/g, '').split(/\.|\[/);

  for (; i < pathArray.length - 1; i++) {
    const currentPath: string = pathArray[i];
    let currentObj: any = obj[currentPath];

    if (resVal[currentPath]) {
      resVal = resVal[currentPath];
    } else if (currentObj) {
      resVal = resVal[currentPath] = Array.isArray(currentObj)
        ? [...currentObj]
        : { ...currentObj };
    } else {
      const nextPath: string = pathArray[i + 1];
      resVal = resVal[currentPath] =
        isInteger(nextPath) && Number(nextPath) >= 0 ? [] : {};
    }
  }

  resVal[pathArray[i]] = value;
  return { ...obj, ...res };
}

/** @private is the given object a Function? */
export const isFunction = (obj: any) => 'function' === typeof obj;


/** @private is the given object an Object? */
export const isObject = (obj: any) => obj !== null && typeof obj === 'object';

/**
 * @private is the given object an Integer? 
 * see https://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
*/
export const isInteger = (obj: any) => String(Math.floor(Number(obj))) === obj;

export const isEmptyChildren = (children: any) =>
  React.Children.count(children) === 0;
