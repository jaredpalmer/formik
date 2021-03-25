import * as React from 'react';
import { FormikValues, GenericFieldHTMLAttributes } from './types';
import { Field, FieldAttributes, FieldProps } from './Field';

export type FastFieldProps<Value = any, FormValues = any> = FieldProps<
  Value,
  FormValues
>;

export type FastFieldConfig<V = any> = FieldAttributes<V> & {
  /**
   * Override FastField's default shouldComponentUpdate
   * @deprecated
   */
  shouldUpdate?: (nextProps: any, props: {}) => boolean;
};

/**
 * @deprecated Field now only subscribes to its own slice of Formik's state.
 */
export const FastField = <Values extends FormikValues>({
  shouldUpdate,
  ...fieldProps
}: GenericFieldHTMLAttributes & FastFieldConfig<Values>) => (
  <Field {...fieldProps} />
);
