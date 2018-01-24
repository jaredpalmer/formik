import * as React from 'react';
import toPath from 'lodash.topath';
import cloneDeep from 'lodash.clonedeep';

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
 * @private Deeply get a value from an object via it's path.
 */
export function dlv(
  obj: any,
  key: string | string[],
  def?: any,
  p: number = 0
) {
  const path = toPath(key);
  while (obj && p < path.length) {
    obj = obj[path[p++]];
  }
  return obj === undefined ? def : obj;
}

/**
 * @private Deeply set a value from in object via it's path.
 * See https://github.com/developit/linkstate
 */
export function setDeep(path: string, value: any, obj: any): any {
  let res: any = {};
  let resVal: any = res;
  let i = 0;
  let pathArray = toPath(path);

  for (; i < pathArray.length - 1; i++) {
    const currentPath: string = pathArray[i];
    let currentObj: any = obj[currentPath];

    if (resVal[currentPath]) {
      resVal = resVal[currentPath];
    } else if (currentObj) {
      resVal = resVal[currentPath] = cloneDeep(currentObj);
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

/** @private is the given object an integer  */
export const isInteger = (obj: any) => String(Math.floor(Number(obj))) === obj;

/** @private Does a React component have exactly 0 children? */
export const isEmptyChildren = (children: any) =>
  React.Children.count(children) === 0;
