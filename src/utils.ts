import cloneDeep from 'lodash.clonedeep';
import toPath from 'lodash.topath';
import React from 'react';

/**
 * Deeply get a value from an object via it's path.
 */
export function getIn(
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
 * Deeply set a value from in object via it's path.
 * @see https://github.com/developit/linkstate
 */
export function setIn(obj: any, path: string, value: any): any {
  let res: any = {};
  let resVal: any = res;
  let i = 0;
  let pathArray = toPath(path);

  for (; i < pathArray.length - 1; i++) {
    const currentPath: string = pathArray[i];
    let currentObj: any = getIn(obj, pathArray.slice(0, i + 1));

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

export function createCopyWithoutKey(obj: any, key: any) {
  const copy: any = {};
  for (let k of Object.keys(obj)) {
    if (k !== key) {
      copy[k] = obj[k];
    }
  }
  return copy;
}

export function isEmptyObject(obj: any) {
  if (Array.isArray(obj)) {
    return obj.every(item => item === undefined);
  }
  return Object.keys(obj).length === 0;
}

export function _unsetIn(obj: any, path: string[]): any {
  const firstPath = Array.isArray(obj) ? Number(path[0]) : path[0];

  if (path.length === 1) {
    return createCopyWithoutKey(obj, firstPath);
  }

  if (!obj.hasOwnProperty(firstPath)) {
    return obj;
  }

  const objAtFirstPart = obj[firstPath];

  const updatedObj = _unsetIn(objAtFirstPart, path.slice(1));

  if (Array.isArray(obj)) {
    obj = obj.slice();

    if (isEmptyObject(updatedObj)) {
      delete obj[firstPath];
    } else {
      obj[firstPath] = updatedObj;
    }

    return obj;
  }

  if (isEmptyObject(updatedObj)) {
    return createCopyWithoutKey(obj, firstPath);
  }

  const copy = { ...obj };
  copy[firstPath] = updatedObj;

  return copy;
}

/**
 * Deeply unsets a value and then removes data structures all the way back to
 * the top if they're empty
 */
export function unsetIn(obj: any, path: string): any {
  const splitPath = toPath(path);
  return _unsetIn(obj, splitPath);
}

/**
 * Recursively a set the same value for all keys and arrays nested object, cloning
 * @param object
 * @param value
 * @param visited
 * @param response
 */
export function setNestedObjectValues<T>(
  object: any,
  value: any,
  visited: any = new WeakMap(),
  response: any = {}
): T {
  for (let k of Object.keys(object)) {
    const val = object[k];
    if (isObject(val)) {
      if (!visited.get(val)) {
        visited.set(val, true);
        // In order to keep array values consistent for both dot path  and
        // bracket syntax, we need to check if this is an array so that
        // this will output  { friends: [true] } and not { friends: { "0": true } }
        response[k] = Array.isArray(val) ? [] : {};
        setNestedObjectValues(val, value, visited, response[k]);
      }
    } else {
      response[k] = value;
    }
  }

  return response;
}

// Assertions

/** @private is the given object a Function? */
export const isFunction = (obj: any): obj is Function =>
  typeof obj === 'function';

/** @private is the given object an Object? */
export const isObject = (obj: any): boolean =>
  obj !== null && typeof obj === 'object';

/** @private is the given object an integer? */
export const isInteger = (obj: any): boolean =>
  String(Math.floor(Number(obj))) === obj;

/** @private is the given object a string? */
export const isString = (obj: any): obj is string =>
  Object.prototype.toString.call(obj) === '[object String]';

/** @private is the given object a NaN? */
export const isNaN = (obj: any): boolean => obj !== obj;

/** @private Does a React component have exactly 0 children? */
export const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

/** @private is the given object/value a promise? */
export const isPromise = (value: any): boolean =>
  isObject(value) && isFunction(value.then);
