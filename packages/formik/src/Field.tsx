import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FieldValidator,
  FieldAsProps,
} from './types';
import { useFormikContext } from './FormikContext';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';

type $FixMe = any;

export type FieldProps<FieldValue = any, FormValues = any, ExtraProps = {}> = {
  field: FieldInputProps<FieldValue>;
  form: FormikProps<FormValues>; // if ppl want to restrict this for a given form, let them.
  meta: FieldMetaProps<FieldValue>;
} & ExtraProps;

export type LegacyComponentProps<FieldValue = any, ExtraProps extends object = {}, FormValues = any> =
  Omit<FieldProps<FieldValue, FormValues>, 'meta'> & ExtraProps;

export type FieldComponent<FieldValue, FormValues, ExtraProps extends object = {}> =
  React.ComponentType<LegacyComponentProps<FieldValue, ExtraProps, FormValues>>;

export type FieldAs<FieldValue, ExtraProps> =
  React.ComponentType<FieldAsProps<FieldValue, ExtraProps>>;

/**
 * These Generics should be flipped, since FieldValue can be inferred
 */
export interface FieldConfig<FieldValue = any, FormValues = any, ExtraProps extends object = {}> {
  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FieldProps<FieldValue, FormValues, ExtraProps>) => JSX.Element;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<FieldValue, FormValues, ExtraProps>) => JSX.Element) | React.ReactNode;

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
  value?: FieldValue;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type NonFormikProps<TValue, GenericProps> = Exclude<TValue,
  | keyof GenericProps
  | keyof FieldConfig
>;

export type FieldAttributes<ExtraProps extends object = {}, FieldValue = any, FormValues = any> =
  GenericFieldHTMLAttributes<FieldValue, FormValues, ExtraProps> &
  FieldConfig<FieldValue, FormValues> &
  ExtraProps;

export type FieldHookConfig<FieldValue, FormValues> =
  GenericFieldHTMLAttributes<FieldValue, FormValues> &
  FieldConfig<FieldValue, FormValues>;

export function useField<FieldValue = any, FormValues = any>(
  propsOrFieldName: string | FieldHookConfig<FieldValue, FormValues>
): [FieldInputProps<FieldValue>, FieldMetaProps<FieldValue>, FieldHelperProps<FieldValue>] {
  const formik = useFormikContext();
  const {
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
    registerField,
    unregisterField,
  } = formik;

  const isAnObject = isObject(propsOrFieldName);

  // Normalize propsOrFieldName to FieldHookConfig<Val>
  const props: FieldHookConfig<FieldValue, FormValues> = isAnObject
    ? (propsOrFieldName as FieldHookConfig<FieldValue, FormValues>)
    : { name: propsOrFieldName as string };

  const { name: fieldName, validate: validateFn } = props;

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
    getFieldProps(props),
    getFieldMeta(fieldName),
    getFieldHelpers(fieldName),
  ];
}

export const isNativeInput = (type?: unknown): type is 'select' | 'input' | 'textarea' => {
  return typeof type === "string";
}

/**
 * @template FormValues Type of Formik's Values. FormValues is never inferrable.
 * @template ExtraProps Custom props passed to underlying component type. Inferrable by Custom Component props or children type signature.
 * @template FieldValue Value type of this Field. Inferrable by the value prop.
 */
export function Field<
  FormValues = any,
  ExtraProps extends object = {},
  FieldValue = any,
>({
  validate,
  name,
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  value,
  ...props
}: FieldAttributes<ExtraProps, FieldValue, FormValues>): JSX.Element {
  const {
    validate: _validate,
    validationSchema: _validationSchema,

    ...formik
  } = useFormikContext<FormValues>();

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${name}" render={({field, form}) => ...} /> with <Field name="${name}">{({field, form, meta}) => ...}</Field>`
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
  const field = formik.getFieldProps<FieldValue, FormValues, ExtraProps>({ name, ...props });
  const meta = formik.getFieldMeta<FieldValue>(name);
  const legacyBag = { field, form: formik };

  if (render) {
    return render({ ...legacyBag, meta });
  }

  if (isFunction(children)) {
    return children({ ...legacyBag, meta });
  }

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === "string") {
      const { innerRef, ...rest } = props;

      return React.createElement(
        component,
        { ref: innerRef, ...field, ...(rest as $FixMe) },
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
      { ref: innerRef, ...field, ...(rest as $FixMe) },
      children
    );
  }

  return React.createElement(asElement, { ...field, ...props }, children);
}

export const MyFieldComponentUsage: React.FC<LegacyComponentProps<number, { why: string }>> = props => {
  return <input onChange={props.field.onChange} />
}

export const MyFieldAsUsage: React.FC<FieldAsProps<number, { why: string }>> = props => {
  return <input onChange={props.onChange} />
}

export type MyFormValues = {
  hello: string;
}

export const MyField = () => {
  return <>
    <Field as="input" name="hello" value={1} />
    <Field as="textarea" name="hello" value={1} />
    <Field as="select" name="hello" value={1} />
    <Field as={MyFieldAsUsage} name="hello" value={1} why="" onChange={event => {}} />
    <Field component={MyFieldComponentUsage} name="hello" value={1} why="" />
  </>
}
