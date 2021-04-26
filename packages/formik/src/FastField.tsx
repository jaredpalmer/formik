import * as React from 'react';
import { FormikValues, PathOf } from './types';
import { Field, FieldAttributes } from './Field';

/**
 * @deprecated Use Field + FieldConfig
 */
export type FastFieldConfig<Values, Path extends PathOf<Values>> =
  FieldAttributes<Values, Path> & {
    shouldUpdate?: (nextProps: any, props: {}) => boolean;
  };

/**
 * @deprecated Field now only subscribes to its own slice of Formik's state.
 */
export const FastField = <
  Values extends FormikValues = any,
  Path extends PathOf<Values> = any
>({ shouldUpdate, ...props}: FastFieldConfig<Values, Path>) => (
  <Field {...(props as FieldAttributes<Values, Path>)} />
);
