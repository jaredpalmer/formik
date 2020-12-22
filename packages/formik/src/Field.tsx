import {
  FieldInputProps,
  FieldMetaProps,
  FormikProps,
  GenericFieldHTMLAttributes,
  isEmptyChildren,
  isFunction,
  SharedFieldProps,
} from '@formik/core';
import * as React from 'react';
import invariant from 'tiny-warning';
import { useFormikContext } from './FormikContext';
import { useField, UseFieldProps } from './hooks';

export interface FieldProps<V = any, FormValues = any> {
  field: FieldInputProps<V>;
  form: FormikProps<FormValues>; // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<V>;
}

export type FieldConfig<
  FieldValue = any,
  FormValues = any
> = UseFieldProps<FieldValue> &
  SharedFieldProps<FieldProps<FieldValue, FormValues>>;

export function Field<FieldValue = any, FormValues = any>({
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  ...props
}: GenericFieldHTMLAttributes & FieldConfig<FieldValue, FormValues>): any {
  React.useEffect(() => {
    invariant(
      !render,
      `<Field render> has been deprecated. Please use a child callback function instead: <Field name={${name}}>{props => ...}</Field> instead.`
    );
    invariant(
      !(component && render),
      'You should not use <Field component> and <Field render> in the same <Field> component; <Field component> will be ignored'
    );

    invariant(
      !(is && children && isFunction(children)),
      'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.'
    );

    invariant(
      !(component && children && isFunction(children)),
      'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.'
    );

    invariant(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <Field render> and <Field children> in the same <Field> component; <FastField children> will be ignored'
    );
    // eslint-disable-next-line
  }, []);

  const [field, meta] = useField<FieldValue>(props);
  const {
    validate: _validate,
    validationSchema: _validationSchema,
    ...formik
  } = useFormikContext<FormValues>();
  const legacyBag = { field, form: formik };

  if (render) {
    // @ts-ignore @todo types
    return isFunction(render) ? render({ ...legacyBag, meta }) : null;
  }

  if (isFunction(children)) {
    // @ts-ignore @todo types
    return children({ ...legacyBag, meta });
  }

  // default to input here so we can check for both `as` and `children` above
  const asElement = is || 'input';

  if (typeof asElement === 'string') {
    const { innerRef, parse, format, formatOnBlur, ...rest } = props;
    return React.createElement(
      asElement,
      { ref: innerRef, ...field, ...rest },
      children
    );
  }
  const { parse, format, formatOnBlur, ...rest } = props;
  return React.createElement(
    asElement as React.ComponentType<FieldInputProps<FieldValue>>,
    { ...field, ...rest },
    children
  );
}
