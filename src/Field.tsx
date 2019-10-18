import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldInputProps,
  FieldValidator,
  FormikValues,
  FieldPropsQuery,
} from './types';
import { useFormikContext } from './FormikContext';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';

export interface FieldProps<
  TFieldName extends keyof TValues & string = any,
  TValues extends FormikValues = FormikValues,
  TError = string
> {
  field: FieldInputProps<TFieldName, TValues, TError>;
  form: FormikProps<TValues, TError>; // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<TValues[TFieldName], TError>;
}

export interface FieldConfig<
  TFieldName extends keyof TValues & string = any,
  TValues extends FormikValues = FormikValues,
  TError = string
> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   * @deprecated
   */
  component?:
    | string
    | React.ComponentType<FieldProps<TFieldName, TValues, TError>>
    | React.ComponentType;

  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | React.ComponentType<FieldProps<TFieldName, TValues, TError>['field']>
    | keyof JSX.IntrinsicElements
    | React.ComponentType;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FieldProps<TFieldName, TValues, TError>) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?:
    | ((props: FieldProps<TFieldName, TValues, TError>) => React.ReactNode)
    | React.ReactNode;

  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator<TValues[TFieldName], TError>;

  /**
   * Field name
   */
  name: TFieldName;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: TValues[TFieldName];

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FieldAttributes<
  TAttributes,
  TFieldName extends keyof TValues & string,
  TValues extends FormikValues = FormikValues,
  TError = string
> = GenericFieldHTMLAttributes &
  FieldConfig<TFieldName, TValues, TError> &
  TAttributes;

export function useField<
  TAttributes = any,
  TFieldName extends keyof TValues & string = any,
  TValues = FormikValues,
  TError = string
>(
  propsOrFieldName:
    | TFieldName
    | FieldAttributes<TAttributes, TFieldName, TValues, TError>
) {
  const formik = useFormikContext<TValues, TError>();
  const { getFieldProps, registerField, unregisterField } = formik;
  const isAnObject = isObject(propsOrFieldName);
  const fieldName = isAnObject
    ? (propsOrFieldName as FieldAttributes<
        TAttributes,
        TFieldName,
        TValues,
        TError
      >).name
    : (propsOrFieldName as TFieldName);
  const validateFn = isAnObject
    ? (propsOrFieldName as FieldAttributes<
        TAttributes,
        TFieldName,
        TValues,
        TError
      >).validate
    : undefined;
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

  if (isObject(propsOrFieldName)) {
    if (__DEV__) {
      invariant(
        (propsOrFieldName as FieldAttributes<
          TAttributes,
          TFieldName,
          TValues,
          TError
        >).name,
        'Invalid field name. Either pass `useField` a string or an object containing a `name` key.'
      );
    }
    return getFieldProps(propsOrFieldName as FieldPropsQuery<
      TFieldName,
      TValues
    >);
  }

  return getFieldProps({ name: propsOrFieldName as TFieldName });
}

export function Field<
  TFieldName extends keyof TValues & string = any,
  TValues = FormikValues,
  TError = string
>({
  validate,
  name,
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  ...props
}: FieldAttributes<any, TFieldName, TValues, TError>) {
  const {
    validate: _validate,
    validationSchema: _validationSchema,

    ...formik
  } = useFormikContext<TValues, TError>();

  React.useEffect(() => {
    if (__DEV__) {
      invariant(
        !render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${name}" render={({field, form}) => ...} /> with <Field name="${name}">{({field, form, meta}) => ...}</Field>`
      );

      invariant(
        !component,
        '<Field component> has been deprecated and will be removed in future versions of Formik. Use <Field as> instead. Note that with the `as` prop, all props are passed directly through and not grouped in `field` object key.'
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
        'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
      );
    }
    // eslint-disable-next-line
  }, []);

  // Register field and field-level validation with parent <Formik>
  const { registerField, unregisterField } = formik;
  React.useEffect(() => {
    registerField(name, {
      validate: validate,
    });
    return () => {
      unregisterField(name);
    };
  }, [registerField, unregisterField, name, validate]);
  const [field, meta] = formik.getFieldProps({
    name,
    ...props,
  } as FieldPropsQuery<TFieldName, TValues>);
  const legacyBag = { field, form: formik };

  if (render) {
    return render(legacyBag);
  }

  if (isFunction(children)) {
    return children({ ...legacyBag, meta });
  }

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      const { innerRef, ...rest } = props;
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...rest },
        children
      );
    }
    // We don't pass `meta` for backwards compat
    return React.createElement(
      component as any,
      { field, form: formik, ...props },
      children
    );
  }

  // default to input here so we can check for both `as` and `children` above
  const asElement = is || 'input';

  if (typeof asElement === 'string') {
    const { innerRef, ...rest } = props;
    return React.createElement(
      asElement,
      { ref: innerRef, ...field, ...rest },
      children
    );
  }

  return React.createElement(
    asElement as any,
    { ...field, ...props },
    children
  );
}
export const FastField = Field;
