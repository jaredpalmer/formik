import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldInputProps,
  FieldValidator,
} from './types';
import { useFormikContext } from './FormikContext';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';

export interface FieldProps<V = any> {
  field: FieldInputProps<V>;
  form: FormikProps<V>; // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<V>;
}

export interface FieldConfig {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   * @deprecated
   */
  component?:
    | string
    | React.ComponentType<FieldProps<any>>
    | React.ComponentType;

  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | React.ComponentType<FieldProps<any>['field']>
    | keyof JSX.IntrinsicElements
    | React.ComponentType;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FieldProps<any>) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<any>) => React.ReactNode) | React.ReactNode;

  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator;

  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: any;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FieldAttributes<T> = GenericFieldHTMLAttributes &
  FieldConfig &
  T & { name: string };

export function useField<Val = any>(
  propsOrFieldName: string | FieldAttributes<Val>
) {
  const formik = useFormikContext();
  if (__DEV__) {
    invariant(
      formik,
      'useField() / <Field /> must be used underneath a <Formik> component or withFormik() higher order component'
    );
  }

  if (isObject(propsOrFieldName)) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        (propsOrFieldName as FieldAttributes<Val>).name,
        'Invalid field name. Either pass `useField` a string or an object containing a `name` key.'
      );
    }
    return formik.getFieldProps(propsOrFieldName);
  }

  return formik.getFieldProps({ name: propsOrFieldName });
}

export function Field({
  validate,
  name,
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  ...props
}: FieldAttributes<any>) {
  const {
    validate: _validate,
    validationSchema: _validationSchema,
    ...formik
  } = useFormikContext();

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

  React.useEffect(() => {
    formik.registerField(name, {
      validate: validate,
    });
    return () => {
      formik.unregisterField(name);
    };
  }, [formik, name, validate]);
  const [field, meta] = formik.getFieldProps({ name, ...props });
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
      component,
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

  return React.createElement(asElement, { ...field, ...props }, children);
}
export const FastField = Field;
