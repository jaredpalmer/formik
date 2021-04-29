import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FieldValidator,
  PathMatchingValue,
} from './types';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';
import { useFieldHelpers, useFieldMeta, useFieldProps } from './hooks/hooks';
import { useFormikConfig, useFormikContext } from './FormikContext';
import { selectFullState } from './helpers/form-helpers';

export type ParseFn<Value> = (value: unknown, name: string) => Value;
export type FormatFn<Value> = (value: Value, name: string) => any;

export type SingleValue<Value> =
  Value extends (infer SingleValue)[]
    ? SingleValue
    : Value;

/**
 * These props are passed from Config to Components.
 *
 * @private
 */
export type FieldPassThroughConfig<Value, Values> = {
  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator<SingleValue<Value>>;

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
  name: PathMatchingValue<Value, Values>;

  /** HTML input type */
  type?: string;

  /** checkbox value to match against current value */
  value?: SingleValue<Value>;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FieldHookConfig<Value, Values> =
  { as?: any } & FieldPassThroughConfig<Value, Values>

export function useField<
  Value = any,
  Values = any
>(
  propsOrFieldName:
    PathMatchingValue<Value, Values> |
    FieldHookConfig<Value, Values>
): [
  FieldInputProps<Value, Values>,
  FieldMetaProps<Value>,
  FieldHelperProps<Value>
] {
  const formik = useFormikContext<Values>();
  const {
    registerField,
    unregisterField,
  } = formik;

  const props: FieldHookConfig<Value, Values> = isObject(propsOrFieldName)
    ? propsOrFieldName
    : { name: propsOrFieldName };

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
    useFieldProps(props, fieldMeta),
    fieldMeta,
    useFieldHelpers(fieldName),
  ];
}

export type FieldAsProps<
  Value = any,
  Values = any
> =
  FieldPassThroughConfig<Value, Values> &
  FieldInputProps<Value, Values>;

export type TypedAsField<Value> = <Values>(
  props: React.PropsWithChildren<FieldAsProps<
    Value,
    Values
  >>
) => React.ReactElement | null;

export abstract class FieldAsClass<
  Value,
> extends React.Component<
  FieldAsProps<
    Value,
    any
  >
> {}

export type FieldAsComponent<Value, Values> =
  any extends Values
  ? React.ComponentType<any>
  : React.ComponentType<FieldAsProps<
      Value,
      Values
    >>;

export type FieldComponentProps<
  Value = any,
  Values = any
> =
  FieldPassThroughConfig<Value, Values> &
  LegacyBag<Value, Values>;

export abstract class FieldComponentClass<
  Value,
> extends React.Component<
  FieldComponentProps<
    Value,
    any
  >
> {}

type FieldComponentComponent<Value, Values> =
  any extends Values
  ? React.ComponentType<any>
  : React.ComponentType<FieldComponentProps<
    Value,
    Values
  >>;

type GenericFieldHTMLConfig = Omit<
  GenericFieldHTMLAttributes,
  keyof FieldPassThroughConfig<any, any>
>;

/**
 * Passed to `<Field component={Component} />`.
 */
type LegacyBag<Value, Values> = {
  field: FieldInputProps<Value, Values>;
  // if ppl want to restrict this for a given form, let them.
  form: FormikProps<Values>;
}

/**
 * Passed to `render={Function}` or `children={Function}`.
 */
export type FieldRenderProps<Value = any, Values = any> =
  LegacyBag<Value, Values> & {
    meta: FieldMetaProps<Value>;
  }

export type FieldRenderFunction<Value, Values> = (
  props: FieldRenderProps<Value, Values>
) => React.ReactElement | null;

/**
 * @deprecated Field types do not share common props. Please choose:
 *
 * FieldComponentProps: `field.component = Component`,
 * FieldAsProps: `field.as = Component`,
 * FieldRenderProps: `field.render, field.children = Function`
 */
export type FieldProps<Value, Values> =
  FieldRenderProps<Value, Values>;

export type TypedComponentField<Value> = <Values>(
  props: FieldComponentProps<Value, Values>
) => React.ReactElement | null;

/**
 * `field.as = string`
 *
 * @private
 */
export type FieldAsStringConfig<Value, Values> =
  React.PropsWithChildren<{
    as: string,
    component?: undefined,
    render?: undefined,
  }>
    & FieldPassThroughConfig<Value, Values>
    & GenericFieldHTMLConfig;


/**
 * `field.as = Component`
 *
 * @private
 */
export type FieldAsComponentConfig<Value, Values> =
  React.PropsWithChildren<
    {
      as: FieldAsComponent<Value, Values>;
      component?: undefined,
      render?: undefined,
    }
  >
    & FieldPassThroughConfig<Value, Values>;

/**
 * `field.component = string`
 *
 * @private
 */
export type FieldStringComponentConfig<Value, Values> =
  React.PropsWithChildren<{
    component: string,
    as?: undefined,
    render?: undefined,
  }>
    & FieldPassThroughConfig<Value, Values>
    & GenericFieldHTMLConfig;

/**
 * `field.component = Component`
 *
 * @private
 */
export type FieldComponentConfig<Value, Values> =
  React.PropsWithChildren<
    {
      component: FieldComponentComponent<Value, Values>;
      as?: undefined,
      render?: undefined,
    }
  >
    & FieldPassThroughConfig<Value, Values>;

/**
 * `field.render = Function`
 *
 * @private
 */
export type FieldRenderConfig<Value, Values> =
  {
    render: FieldRenderFunction<Value, Values>;
    as?: undefined,
    component?: undefined,
    children?: undefined
  } & FieldPassThroughConfig<Value, Values>;

/**
 * `field.children = Function`
 *
 * @private
 */
export type FieldChildrenConfig<Value, Values> =
  {
    children: FieldRenderFunction<Value, Values>;
    as?: undefined,
    component?: undefined,
    render?: undefined,
  } & FieldPassThroughConfig<Value, Values>;

/**
 * no config, `<Field name="">`
 *
 * @private
 */
export type FieldDefaultConfig<Value, Values> =
  {
    as?: undefined,
    component?: undefined,
    render?: undefined,
    children?: undefined,
  }
    & FieldPassThroughConfig<Value, Values>
    & GenericFieldHTMLConfig;

export type FieldConfig<Value, Values> =
  FieldAsStringConfig<Value, Values> |
  FieldAsComponentConfig<Value, Values> |
  FieldStringComponentConfig<Value, Values> |
  FieldComponentConfig<Value, Values> |
  FieldRenderConfig<Value, Values> |
  FieldChildrenConfig<Value, Values> |
  FieldDefaultConfig<Value, Values>;

/**
 * @deprecated use `FieldConfig`
 */
export type FieldAttributes<Value, Values> =
  FieldConfig<Value, Values>;

export function Field<
  Value = any,
  Values = any,
>(
  props: FieldConfig<Value, Values>
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
    } = props;
    return React.createElement(
      as,
      { ...fieldAsProps, ...field },
      children
    );
  }

  if (props.component && typeof props.component !== 'string') {
    const {
      render,
      children,
      as,
      component,
      ...componentProps
    } = props;

    // We don't pass `meta` for backwards compat
    return React.createElement(
      component,
      { field, ...componentProps, form },
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
    { ref: props.innerRef, ...field, ...htmlProps },
    children
  );
}
