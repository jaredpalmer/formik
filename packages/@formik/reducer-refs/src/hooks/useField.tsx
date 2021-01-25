import * as React from 'react';
import {
  FieldHelperProps,
  FieldInputProps,
  FieldMetaProps,
  FieldValidator,
} from '@formik/core';
import { useFormikApi } from './useFormikApi';
import invariant from 'tiny-warning';
import { useFieldMeta } from './hooks';

export type UseFieldProps<Value = any> = {
  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | string
    | React.ComponentType<FieldInputProps<Value>>
    | React.ForwardRefExoticComponent<FieldInputProps<Value>>;

  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator;

  /**
   * Function to parse raw input value before setting it to state
   */
  parse?: (value: unknown, name: string) => Value;

  /**
   * Function to transform value passed to input
   */
  format?: (value: Value, name: string) => any;

  /**
   * Wait until blur event before formatting input value?
   * @default false
   */
  formatOnBlur?: boolean;

  /**
   * HTML multiple attribute
   */
  multiple?: boolean;
  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: Value;
};

/**
 * Example of an optimized comparer.
 */
export const fieldMetaIsEqual = <Value,>(
  prev: FieldMetaProps<Value>,
  next: FieldMetaProps<Value>
) =>
  prev.value === next.value &&
  prev.touched === next.touched &&
  prev.error === next.error &&
  prev.initialValue === next.initialValue &&
  prev.initialTouched === next.initialTouched &&
  prev.initialError === next.initialError;

export function useField<Value = any, FormValues = any>(
  nameOrOptions: string | UseFieldProps<Value>
): [FieldInputProps<Value>, FieldMetaProps<Value>, FieldHelperProps<Value>] {
  const formik = useFormikApi<FormValues>();

  const {
    getFieldProps,
    getFieldHelpers,
    registerField,
    unregisterField,
  } = formik;

  const props =
    typeof nameOrOptions === 'string' ? { name: nameOrOptions } : nameOrOptions;

  const { name: fieldName, validate: validateFn } = props;

  const fieldMeta = useFieldMeta<Value>(fieldName);

  React.useEffect(() => {
    if (fieldName) {
      registerField(fieldName, {
        validate: validateFn,
      });
    }
    return () => {
      if (fieldName) {
        unregisterField(fieldName);
      }
    };
  }, [registerField, unregisterField, fieldName, validateFn]);

  if (__DEV__) {
    invariant(
      formik,
      'useField() / <Field /> must be used underneath a <Formik> component or withFormik() higher order component'
    );
  }

  invariant(
    fieldName,
    'Invalid field name. Either pass `useField` a string or an object containing a `name` key.'
  );

  return [
    // todo: this could go out of sync with fieldMeta
    getFieldProps(props),
    fieldMeta,
    getFieldHelpers(fieldName),
  ];
}
