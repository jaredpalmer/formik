import * as React from 'react';
import {
  isFunction,
  isEmptyChildren,
  FieldInputProps,
  FieldMetaProps,
  GenericFieldHTMLAttributes,
  FormikProps,
} from '@formik/core';
import invariant from 'tiny-warning';
import { FormikRefApi, useFormikApi } from '../hooks/useFormikApi';
import { useField, UseFieldProps } from '../hooks/useField';
import { useFullFormikState } from '../hooks/useFullFormikState';

export interface FieldProps<Value = any, FormValues = any> {
  field: FieldInputProps<Value>;
  // if ppl want to restrict this for a given form, let them.
  form: FormikProps<FormValues>;
  meta: FieldMetaProps<Value>;
}

export interface FieldPropsWithoutState<Value = any, FormValues = any> {
  field: FieldInputProps<Value>;
  // if ppl want to restrict this for a given form, let them.
  form: FormikRefApi<FormValues>;
  meta: FieldMetaProps<Value>;
}

export type FieldComponentProps<Value = any, FormValues = any> = Omit<
  FieldPropsWithoutState<Value, FormValues>,
  'meta'
>;

export interface FieldRenderProps<Value = any, FormValues = any> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FieldComponentProps<Value, FormValues>>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FieldProps<Value, FormValues>) => React.ReactElement | null;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?:
    | ((props: FieldProps<Value, FormValues>) => React.ReactElement | null)
    | React.ReactNode
    | null;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FieldConfig<
  FieldValue = any,
  FormValues = any
> = UseFieldProps<FieldValue> & FieldRenderProps<FieldValue, FormValues>;

export function Field<FieldValue = any, FormValues = any>(
  rawProps: GenericFieldHTMLAttributes & FieldConfig<FieldValue, FormValues>
) {
  const {
    render,
    children,
    as: is, // `as` is reserved in typescript lol
    component,
    ...props
  } = rawProps;

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${rawProps.name}" render={({field, form}) => ...} /> with <Field name="${rawProps.name}">{({field, form, meta}) => ...}</Field>`
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
      // eslint-disable-next-line
    }, []);
  }

  const [field, meta] = useField(props);

  /**
   * If we use render function or use functional children, we continue to
   * subscribe to the full FormikState because these do not have access to hooks.
   *
   * Otherwise, we will pointlessly get the initial values but never subscribe to updates.
   */
  const formikApi = useFormikApi<FormValues>();
  const formikState = useFullFormikState(
    formikApi,
    !!render || isFunction(children)
  );

  const legacyBag = { field, form: { ...formikState, ...formikApi } };

  if (render) {
    return isFunction(render) ? render({ ...legacyBag, meta }) : null;
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
      { ...props, field, form: formikApi },
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
