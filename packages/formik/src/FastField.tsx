import * as React from 'react';
import { FormikValues } from './types';
import { Field, FieldAttributes } from './Field';

/**
 * @deprecated Use Field + FieldConfig
 */
export type FastFieldConfig<Value, Values> =
  FieldAttributes<Value, Values> & {
    shouldUpdate?: (nextProps: any, props: {}) => boolean;
  };

/**
 * @deprecated Field now only subscribes to its own slice of Formik's state.
 */
export const FastField = <
  Value extends any = any,
  Values extends FormikValues = any
>({ shouldUpdate, ...props}: FastFieldConfig<Value, Values>) => (
  <Field {...(props as FieldAttributes<Value, Values>)} />
);
