import * as React from 'react';
import {
  GenericFieldHTMLAttributes,
  FormikValues,
} from '@formik/core';
import { FieldConfig, FieldProps } from '../hooks/useField';
import { Field } from './Field';

/**
 * @deprecated please use FieldProps (and Field or useField!)
 */
export type FastFieldProps<V> = FieldProps<V>;

/**
 * @deprecated please use FieldConfig (and Field or useField!)
 */
export type FastFieldConfig<T> = FieldConfig & {
  /** Override FastField's default shouldComponentUpdate */
  shouldUpdate?: (
    nextProps: T & GenericFieldHTMLAttributes,
    props: {}
  ) => boolean;
};

/**
 * @deprecated please use FieldAttributes (and Field or useField!)
 */
export type FastFieldAttributes<T> = GenericFieldHTMLAttributes &
  FastFieldConfig<T> &
  T;

/**
 * @deprecated Please use Field! We promise it is fast now!
 */
export const FastField = <Value extends FormikValues>(
  { shouldUpdate, ...fieldProps }: FastFieldConfig<Value>
) => <Field {...fieldProps} />;
