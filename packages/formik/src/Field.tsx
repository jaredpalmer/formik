import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FieldValidator,
} from './types';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';
import { useFieldMeta } from './hooks/hooks';
import { useFormikContext } from './FormikContext';
import { selectFullState } from './helpers/form-helpers';

export interface FieldProps<V = any, FormValues = any> {
  field: FieldInputProps<V>;
  form: FormikProps<FormValues>; // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<V>;
}

export interface FieldConfig<V = any> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FieldProps<V>>
    | React.ComponentType
    | React.ForwardRefExoticComponent<any>;

  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | React.ComponentType<FieldProps<V>['field']>
    | string
    | React.ComponentType
    | React.ForwardRefExoticComponent<any>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FieldProps<V>) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<V>) => React.ReactNode) | React.ReactNode;

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
  FieldConfig<T> &
  T & { name: string };

export type FieldHookConfig<T> = GenericFieldHTMLAttributes & FieldConfig<T>;

export function useField<Val = any, FormValues = any>(
  propsOrFieldName: string | FieldHookConfig<Val>
): [FieldInputProps<Val>, FieldMetaProps<Val>, FieldHelperProps<Val>] {
  const formik = useFormikContext<FormValues>();
  const {
    getFieldProps,
    getFieldHelpers,
    registerField,
    unregisterField,
  } = formik;

  const isAnObject = isObject(propsOrFieldName);

  // Normalize propsOrFieldName to FieldHookConfig<Val>
  const props: FieldHookConfig<Val> = isAnObject
    ? (propsOrFieldName as FieldHookConfig<Val>)
    : { name: propsOrFieldName as string };

  const { name: fieldName, validate: validateFn } = props;

  const fieldMeta = useFieldMeta<Val>(fieldName);

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
    // use fieldProps based on current render meta
    getFieldProps(props, fieldMeta),
    fieldMeta,
    getFieldHelpers(fieldName),
  ];
}

export function Field<_FieldValue = any, FormValues = any>({
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  ...props
}: FieldAttributes<any>) {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${props.name}" render={({field, form}) => ...} /> with <Field name="${props.name}">{({field, form, meta}) => ...}</Field>`
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
   * We also do this for Component for backwards compatibility.
   *
   * Otherwise, we will pointlessly get the initial values but never subscribe to updates.
   */
  const formikApi = useFormikContext<FormValues>();
  const formikState = formikApi.useState(
    selectFullState,
    Object.is,
    !!render || isFunction(children) || (!!component && typeof component !== 'string')
  );

  const legacyBag = { field, form: { ...formikState, ...formikApi } };

  if (render) {
    return render({ ...legacyBag, meta });
  }

  if (isFunction(children)) {
    return children({ ...legacyBag, meta });
  }

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      const { innerRef, validate, ...rest } = props;
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...rest },
        children
      );
    }
    // We don't pass `meta` for backwards compat
    return React.createElement(
      component,
      { field, form: legacyBag.form, ...props },
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
