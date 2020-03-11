/**
 * Copyright (c) Formik, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/** Simple field validation fn */
export type ValidatorFn = (value: any) => string | undefined;

/**
 * Field state, helper methods, and config that will be registered
 * to the parent context.
 */
export interface FieldStateAndOperations<V = unknown> {
  value: V;
  touched: boolean;
  error?: string;
  validate?: ValidatorFn;
  setError: (err?: string) => void;
  setValue: (val?: any) => void;
  setTouched: (isTouched: boolean) => void;
}

export type $FixMe = any;
