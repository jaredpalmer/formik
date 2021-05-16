import * as React from 'react';
import { FormikValues } from './types';
import { Field } from './Field';
import { FieldConfig } from './Field.types';

interface FastFieldExtraConfig {
  shouldUpdate?: (nextProps: any, props: {}) => boolean;
}

/**
 * @deprecated Use Field + FieldConfig
 */
export type FastFieldConfig<Value, Values> =
  FieldConfig<Value, Values> & FastFieldExtraConfig;

/**
 * @deprecated Field now only subscribes to its own slice of Formik's state.
 */
export const FastField = <
  Value extends any = any,
  Values extends FormikValues = any
>({ shouldUpdate, ...props}: FastFieldConfig<Value, Values>) => (
  <Field {...(props as FieldConfig<Value, Values>)} />
);
