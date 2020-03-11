/**
 * Copyright (c) Formik, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import * as React from 'react';

// Assertions

/** @private is the value an empty array? */
export const isEmptyArray = (value?: any) =>
  Array.isArray(value) && value.length === 0;

/** @private is the given object a Function? */
export const isFunction = (obj: any): obj is Function =>
  typeof obj === 'function';

/** @private is the given object an Object? */
export const isObject = (obj: any): obj is Object =>
  obj !== null && typeof obj === 'object';

/** @private is the given object an integer? */
export const isInteger = (obj: any): boolean =>
  String(Math.floor(Number(obj))) === obj;

/** @private is the given object a string? */
export const isString = (obj: any): obj is string =>
  Object.prototype.toString.call(obj) === '[object String]';

/** @private is the given object a NaN? */
// eslint-disable-next-line no-self-compare
export const isNaN = (obj: any): boolean => obj !== obj;

/** @private Does a React component have exactly 0 children? */
export const isEmptyChildren = (children: any): boolean =>
  React.Children.count(children) === 0;

/** @private is the given object/value a promise? */
export const isPromise = (value: any): value is PromiseLike<any> =>
  isObject(value) && isFunction(value.then);

/** @private is the given object/value a type of synthetic event? */
export const isInputEvent = (value: any): value is React.SyntheticEvent<any> =>
  value && isObject(value) && isObject(value.target);

/** @private Are we in RN? */
export const isReactNative =
  typeof window !== 'undefined' &&
  window.navigator &&
  window.navigator.product &&
  window.navigator.product === 'ReactNative';
