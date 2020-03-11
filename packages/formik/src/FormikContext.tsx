/**
 * Copyright (c) Formik, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as React from 'react';
import { useFormik } from './useFormik';

// @todo fix type def
export type FormikContextType = ReturnType<typeof useFormik>;

export const FormikContext = createNamedContext<FormikContextType>(
  'FormikContext',
  {} as FormikContextType
);

function createNamedContext<ContextValueType>(
  name: string,
  defaultValue: ContextValueType
): React.Context<ContextValueType> {
  const Ctx = React.createContext<ContextValueType>(defaultValue);
  Ctx.displayName = name;
  return Ctx;
}
