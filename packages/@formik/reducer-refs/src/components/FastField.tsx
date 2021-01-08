import * as React from 'react';
import { FormikValues, GenericFieldHTMLAttributes } from '@formik/core';
import { Field, FieldConfig, FieldProps } from './Field';

export type FastFieldProps<Value = any, FormValues = any> = FieldProps<
  Value,
  FormValues
>;

export type FastFieldConfig<V = any> = FieldConfig<V> & {
  /**
   * Override FastField's default shouldComponentUpdate
   * @deprecated
   */
  shouldUpdate?: (nextProps: any, props: {}) => boolean;
};

/**
 * @deprecated Please use Field! We promise it is fast now!
 */
export const FastField = <Values extends FormikValues>({
  shouldUpdate,
  ...fieldProps
}: GenericFieldHTMLAttributes & FastFieldConfig<Values>) => (
  <Field {...fieldProps} />
);
