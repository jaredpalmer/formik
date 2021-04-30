import * as React from 'react';
import { FormikValues } from './types';
import { Field } from './Field';
import { FieldConfig } from './Field.types';

/**
 * @deprecated Use Field + FieldConfig
 */
export type FastFieldConfig<Value, Values> =
  FieldConfig<Value, Values> & {
    shouldUpdate?: (nextProps: any, props: {}) => boolean;
  };

/**
 * @deprecated Field now only subscribes to its own slice of Formik's state.
 */
export const FastField = <
  Value extends any = any,
  Values extends FormikValues = any
>({ shouldUpdate, ...props}: FastFieldConfig<Value, Values>) => (
  <Field {...(props as FieldConfig<Value, Values>)} />
);
