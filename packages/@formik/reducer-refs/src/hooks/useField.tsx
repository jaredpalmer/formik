import * as React from 'react';
import { FormEffect } from '../types';
import isEqual from 'react-fast-compare';
import {
  FieldHelperProps,
  FieldInputProps,
  FieldMetaProps,
  FieldValidator,
} from '@formik/core';
import { useFormikApi } from './useFormikApi';
import invariant from 'tiny-warning';
import { selectRefGetFieldMeta } from '../ref-selectors';

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

export function useField<Value = any, FormValues = any>(
  nameOrOptions: string | UseFieldProps<Value>
): [
  FieldInputProps<Value>,
  FieldMetaProps<FormValues>,
  FieldHelperProps<Value>
] {
  const formik = useFormikApi<FormValues>();

  const {
    addFormEffect,
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
    registerField,
    unregisterField,
  } = formik;

  const props =
    typeof nameOrOptions === 'string' ? { name: nameOrOptions } : nameOrOptions;

  const { name: fieldName, validate: validateFn } = props;

  const fieldMetaRef = React.useRef(getFieldMeta<FormValues>(fieldName));
  const [fieldMeta, setFieldMeta] = React.useState(fieldMetaRef.current);

  const maybeUpdateFieldMeta = React.useCallback<FormEffect<any>>(
    formikState => {
      const fieldMeta = selectRefGetFieldMeta(() => formikState)(fieldName);

      if (!isEqual(fieldMeta, fieldMetaRef.current)) {
        fieldMetaRef.current = fieldMeta;
        setFieldMeta(fieldMeta);
      }
    },
    [fieldName, setFieldMeta, fieldMetaRef]
  );

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

  React.useEffect(() => {
    return addFormEffect(maybeUpdateFieldMeta);
  }, []);

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
