import * as React from 'react';
import invariant from 'tiny-warning';
import { useFormikContext } from './FormikContext';
import {
  FieldInputProps,
  FieldMetaProps,
  FormikProps,
  GenericFieldHTMLAttributes,
  SharedFieldProps,
} from './types';
import { useField, UseFieldProps } from './useField';
import { isEmptyChildren, isFunction } from './utils';

export interface FieldProps<V, FormValues> {
  field: FieldInputProps<V>;
  form: FormikProps<FormValues>; // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<V>;
}

export type FieldConfig<FieldValue, FormValues> = UseFieldProps<FieldValue> &
  SharedFieldProps<FieldProps<FieldValue, FormValues>>;

export function Field<FieldValue = any, FormValues = any>({
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  ...props
}: GenericFieldHTMLAttributes & FieldConfig<FieldValue, FormValues>) {
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
    return render({ ...legacyBag, meta });
  }

  if (isFunction(children)) {
    return children({ ...legacyBag, meta });
  }

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      const { innerRef, parse, format, formatOnBlur, ...rest } = props;
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...rest },
        children
      );
    }

    const { parse, format, formatOnBlur, ...rest } = props;
    return React.createElement(
      component,
      // @todo this is wrong type signature
      { ...legacyBag, meta, ...rest } as FieldProps<FieldValue, FormValues>,
      children
    );
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
