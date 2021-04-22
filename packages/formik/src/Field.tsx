import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FieldValidator,
  FieldValue,
  NameOf,
} from './types';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';
import { useFieldHelpers, useFieldMeta, useFieldProps } from './hooks/hooks';
import { useFormikConfig, useFormikContext } from './FormikContext';
import { selectFullState } from './helpers/form-helpers';

/**
 * If ExtraProps is any, allow any props
 */
export type ExtraPropsOrAnyProps<ExtraProps> = object extends ExtraProps
    ? Record<string, any>
    : ExtraProps;

export type ParseFn<Value> = (value: unknown, name: string) => Value;
export type FormatFn<Value> = (value: Value, name: string) => any;

export type SingleValue<Value> =
  Value extends (infer SingleValue)[]
    ? SingleValue
    : Value;

/**
 * @private
 */
export type FieldBaseConfig<Value, Values, Path extends NameOf<Values>> = {
  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator<Value>;

  /**
   * Function to parse raw input value before setting it to state
   */
  parse?: ParseFn<SingleValue<Value>>;

  /**
   * Function to transform value passed to input
   */
  format?: FormatFn<SingleValue<Value>>;

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
  name: Path;

  /** HTML input type */
  type?: string;

  /** checkbox value to match against current value */
  value?: SingleValue<Value>;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

type FieldAsPropsWithoutExtraProps<
  Value,
  Values,
  Path extends NameOf<Values>
> =
  FieldBaseConfig<Value, Values, Path> &
  FieldInputProps<Value>;

type FieldAsExtraProps = Omit<
  Record<string, any>,
  'as' | 'component' | 'render' | 'children' |
    keyof FieldAsPropsWithoutExtraProps<any, any, any>
>;

export type FieldAsProps<
  Value = any,
  Values = any,
  Path extends NameOf<Values> = any,
  ExtraProps extends FieldAsExtraProps = {}
> =
  FieldAsPropsWithoutExtraProps<Value, Values, Path> &
  ExtraPropsOrAnyProps<ExtraProps>;

export type TypedAsField<Value, ExtraProps = {}> = <Values, Path extends NameOf<Values>>(
  props: FieldAsProps<
    Value,
    Values,
    Path,
    ExtraProps
  >
) => React.ReactElement | null;

export type FieldHookConfig<Values, Path extends NameOf<Values>, ExtraProps = {}> = {
  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | string
    | TypedAsField<FieldValue<Values, Path>, ExtraProps>
    | React.ComponentType<FieldAsProps<FieldValue<Values, Path>, Values, Path, ExtraProps>>;

  /**
   * Field name
   */
  name: Path;
} & FieldBaseConfig<FieldValue<Values, Path>, Values, Path>;

export function useField<Values = any, Path extends NameOf<Values> = any, ExtraProps = {}>(
  propsOrFieldName:
    Path |
    FieldHookConfig<Values, Path, ExtraProps>
): [
  FieldInputProps<FieldValue<Values, Path>>,
  FieldMetaProps<FieldValue<Values, Path>>,
  FieldHelperProps<FieldValue<Values, Path>>
] {
  const formik = useFormikContext<Values>();
  const {
    registerField,
    unregisterField,
  } = formik;

  const props: FieldBaseConfig<FieldValue<Values, Path>, Values, Path> = isObject(propsOrFieldName)
    ? propsOrFieldName
    : { name: propsOrFieldName };

  const { name: fieldName, validate: validateFn } = props;

  const fieldMeta = useFieldMeta<FieldValue<Values, Path>>(fieldName);

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
    useFieldProps(props, fieldMeta),
    fieldMeta,
    useFieldHelpers(fieldName),
  ];
}

export type BaseConfig<Values, Path extends NameOf<Values>, ExtraProps> = {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<
        FieldComponentProps<FieldValue<Values, Path>, Values, Path, ExtraProps>
      >
    | TypedComponentField<FieldValue<Values, Path>, ExtraProps>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: FieldRenderFunction<Values, Path>;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: FieldRenderFunction<Values, Path> | React.ReactNode;
} &
  FieldHookConfig<Values, Path, ExtraProps>;

type GenericFieldHTMLConfig = Omit<
  GenericFieldHTMLAttributes,
  keyof BaseConfig<any, any, any>
>;

type LegacyBag<Values, Path extends NameOf<Values>> = {
  field: FieldInputProps<FieldValue<Values, Path>>;
  // if ppl want to restrict this for a given form, let them.
  form: FormikProps<Values>;
}

export type FieldRenderProps<Values = any, Path extends NameOf<Values> = any> =
  LegacyBag<Values, Path> & {
    meta: FieldMetaProps<FieldValue<Values, Path>>;
  }

/**
 * @deprecated Field types do not share common props. Please choose:
 *
 * FieldComponentProps -> `field.component`,
 * FieldAsProps -> `field.as`,
 * FieldRenderProps -> `field.render, field.children = Function`
 */
export type FieldProps<Values, Path extends NameOf<Values>> = FieldRenderProps<Values, Path>;

type FieldComponentPropsWithoutExtraProps<
  Value,
  Values,
  Path extends NameOf<Values>
> =
  FieldBaseConfig<Value, Values, Path> &
  LegacyBag<Values, Path>;

type FieldComponentExtraProps = Omit<
  Record<string, any>,
  'as' | 'component' | 'render' | 'children' |
    keyof FieldComponentPropsWithoutExtraProps<any, any, any>
>;

export type FieldComponentProps<
  Value = any,
  Values = any,
  Path extends NameOf<Values> = any,
  ExtraProps extends FieldComponentExtraProps = {}
> =
  FieldComponentPropsWithoutExtraProps<Value, Values, Path> &
  ExtraPropsOrAnyProps<ExtraProps>;

export type TypedComponentField<Value, ExtraProps = {}> = <Values, Path extends NameOf<Values>>(
  props: FieldComponentProps<
    Value,
    Values,
    Path,
    ExtraProps
  >
) => React.ReactElement | null;

/**
 * field.as = string
 *
 * @private
 */
export type FieldAsStringConfig<Values, Path extends NameOf<Values>, ExtraProps> =
  BaseConfig<Values, Path, ExtraProps> & React.PropsWithChildren<{
    as: string,
    component?: undefined,
    render?: undefined,
  }> & GenericFieldHTMLConfig;

/**
 * field.as = Component
 *
 * @private
 */
export type FieldAsComponentConfig<
  Values,
  Path extends NameOf<Values>,
  ExtraProps extends FieldAsExtraProps
> =
  React.PropsWithChildren<
    {
      as: React.ComponentType<FieldAsProps<FieldValue<Values, Path>, Values, Path, ExtraProps>>,
      component?: undefined,
      render?: undefined,
    }
  > &
    FieldHookConfig<Values, Path, ExtraProps> &
    ExtraPropsOrAnyProps<ExtraProps>;

/**
 * field.component = string
 *
 * @private
 */
export type FieldStringComponentConfig<Values, Path extends NameOf<Values>> =
  BaseConfig<Values, Path, {}> & React.PropsWithChildren<{
    as?: undefined,
    component: string,
    render?: undefined,
  }> & GenericFieldHTMLConfig;

/**
 * field.component = Component
 *
 * @private
 */
export type FieldComponentConfig<
  Values,
  Path extends NameOf<Values>,
  ExtraProps extends FieldComponentExtraProps
> =
  BaseConfig<Values, Path, ExtraProps> & React.PropsWithChildren<
    {
      as?: undefined,
      component: React.ComponentType<
        FieldComponentProps<FieldValue<Values, Path>, Values, Path, ExtraProps>
      >,
      render?: undefined,
    }
  > & ExtraPropsOrAnyProps<ExtraProps>;

export type FieldRenderFunction<Values, Path extends NameOf<Values>> = (
  props: FieldRenderProps<Values, Path>
) => React.ReactElement | null;

/**
 * field.render = Function
 *
 * @private
 */
export type FieldRenderConfig<Values, Path extends NameOf<Values>> =
  BaseConfig<Values, Path, {}> & {
    as?: undefined,
    component?: undefined,
    render: FieldRenderFunction<Values, Path>;
    children?: undefined
  };

/**
 * field.children = Function
 *
 * @private
 */
export type FieldChildrenConfig<Values, Path extends NameOf<Values>> =
  BaseConfig<Values, Path, {}> & {
    as?: undefined,
    component?: undefined,
    render?: undefined,
    children: FieldRenderFunction<Values, Path>;
  };

/**
 * no config, <Field name="">
 *
 * @private
 */
export type FieldDefaultConfig<Values, Path extends NameOf<Values>> =
  BaseConfig<Values, Path, {}> & {
    as?: undefined,
    component?: undefined,
    render?: undefined,
    children?: undefined,
  } & GenericFieldHTMLConfig;

export type FieldConfig<Values, Path extends NameOf<Values>, ExtraProps = {}> =
  FieldAsStringConfig<Values, Path, ExtraProps> |
  FieldAsComponentConfig<Values, Path, ExtraProps> |
  FieldStringComponentConfig<Values, Path> |
  FieldComponentConfig<Values, Path, ExtraProps> |
  FieldRenderConfig<Values, Path> |
  FieldChildrenConfig<Values, Path> |
  FieldDefaultConfig<Values, Path>;

/**
 * @deprecated use `FieldConfig`
 */
export type FieldAttributes<Values, Path extends NameOf<Values>, ExtraProps = {}> =
  FieldConfig<Values, Path, ExtraProps>;

export function Field<
  Values = any,
  Path extends NameOf<Values> = any,
  ExtraProps = {}
>(
  props: FieldConfig<Values, Path, ExtraProps>
) {
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !props.render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${props.name}" render={({field, form}) => ...} /> with <Field name="${props.name}">{({field, form, meta}) => ...}</Field>`
      );

      invariant(
        !(props.as && props.children && isFunction(props.children)),
        'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.'
      );

      invariant(
        !(props.component && props.children && isFunction(props.children)),
        'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.'
      );

      invariant(
        !(
          props.render &&
          props.children &&
          // impossible type
          !isEmptyChildren((props as any).children)
        ),
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
  const formikApi = useFormikContext<Values>();
  const formikConfig = useFormikConfig();
  const formikState = formikApi.useState(
    selectFullState,
    Object.is,
    !!props.render || isFunction(props.children) || (!!props.component && typeof props.component !== 'string')
  );

  const form = {
      ...formikApi,
      ...formikConfig,
      ...formikState,
  };

  if (props.render) {
    return props.render({ field, form, meta });
  }

  if (isFunction(props.children)) {
    return props.children({ field, form, meta });
  }

  if (props.as && typeof props.as !== 'string') {
    const {
      render,
      component,
      as,
      children,
      ...fieldAsProps
    } = props as FieldAsComponentConfig<Values, Path, ExtraProps>;
    return React.createElement(
      props.as,
      { ...fieldAsProps, ...field } as any,
      children
    );
  }

  if (props.component && typeof props.component !== 'string') {
    const {
      // render props
      render,
      children,
      as,
      component,
      ...componentProps
    } = props as FieldComponentConfig<Values, Path, ExtraProps>;

    // We don't pass `meta` for backwards compat
    return React.createElement(
      component,
      { field, form, ...componentProps } as any,
      children
    );
  }

  const {
    innerRef,
    validate,
    parse,
    format,
    formatOnBlur,
    name,
    value,
    as,
    component,
    render,
    children,
    ...htmlProps
  } = props;

  return React.createElement(
    props.as || props.component || "input",
    // field has FieldValue<> while HTML expects
    { ref: props.innerRef, ...field, ...htmlProps } as any,
    children
  );
}
