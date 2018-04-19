import * as React from 'react';
import toPath from 'lodash.topath';

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

function _updateIn(obj: any, path: string[], value: any): any {
  const firstPath = Array.isArray(obj) ? Number(path[0]) : path[0];

  if (path.length == 1) {
    if (Array.isArray(obj)) {
      obj = obj.slice();
      obj[firstPath] = value;
      return obj;
    }

    return {
      ...obj,
      [firstPath]: value,
    };
  }

  const objAtFirstPart = obj[firstPath];

  let nextObj = objAtFirstPart;

  if (!objAtFirstPart) {
    const nextPartIsArrayIndex = isInteger(path[1]) && Number(path[1]) >= 0;
    nextObj = nextPartIsArrayIndex ? [] : {};
  }

  const updatedObj = _updateIn(nextObj, path.slice(1), value);

  if (Array.isArray(obj)) {
    obj = obj.slice();
    obj[firstPath] = updatedObj;
    return obj;
  }

  return {
    ...obj,
    [firstPath]: updatedObj,
  };
}

/**
 * Deeply set a value from in object via it's path.
 * @see https://github.com/developit/linkstate
 */
export function setIn(obj: any, path: string, value: any): any {
  const splitPath = toPath(path);
  return _updateIn(obj, splitPath, value);
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
export const isFunction = (obj: any): boolean => typeof obj === 'function';

/** @private is the given object an Object? */
export const isObject = (obj: any): boolean =>
  obj !== null && typeof obj === 'object';

/** @private is the given object an integer? */
export const isInteger = (obj: any): boolean =>
  String(Math.floor(Number(obj))) === obj;

/** @private is the given object a string? */
export const isString = (obj: any): boolean =>
  Object.prototype.toString.call(obj) === '[object String]';

/** @private is the given object a NaN? */
export const isNaN = (obj: any): boolean => obj !== obj;

/** @private Does a React component have exactly 0 children? */
export const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

/** @private is the given object/value a promise? */
export const isPromise = (value: any): boolean =>
  isObject(value) && isFunction(value.then);
