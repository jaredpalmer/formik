import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FieldValidator,
  FieldValue,
  PathOf,
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
export type FieldPassThroughConfig<Path, Value> = {
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
  name: Path;

  /** HTML input type */
  type?: string;

  /** checkbox value to match against current value */
  value?: SingleValue<Value>;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FieldHookConfigByPath<Values, Path extends PathOf<Values>> = { as?: any } &
  FieldPassThroughConfig<Path, FieldValue<Values, Path>>;

export type FieldHookConfig<Values, Path extends PathOf<Values>> =
  FieldHookConfigByPath<Values, Path>

export function useField<
  Values = any,
  Path extends PathOf<Values> = any,
>(
  propsOrFieldName:
    Path |
    FieldHookConfig<Values, Path>
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

  const props: FieldHookConfig<Values, Path> = isObject(propsOrFieldName)
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

export type FieldAsProps<
  Values = any,
  Value = any
> =
  FieldPassThroughConfig<PathMatchingValue<Values, Value>, Value> &
  FieldInputProps<Value>;

export type TypedAsField<
  Value,
> = <
  Values,
>(
  props: React.PropsWithChildren<FieldAsProps<
    Values,
    Value
  >>
) => React.ReactElement | null;

export abstract class FieldAsClass<
  Value,
> extends React.Component<
  FieldAsProps<
    unknown,
    Value
  >
> {}

export type FieldAsComponent<Values, Value> =
  React.ComponentType<FieldAsProps<
    Values,
    Value
  >>;

export type FieldComponentProps<
  Value = any,
  Values = any,
> =
  FieldPassThroughConfig<PathMatchingValue<Values, Value>, Value> &
  LegacyBag<Values, Value>;

export abstract class FieldComponentClass<
  Value,
> extends React.Component<
  FieldComponentProps<
    Value,
    any
  >
> {}

type FieldComponentComponent<Values, Value> =
  React.ComponentType<FieldComponentProps<
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
type LegacyBag<Values, Value> = {
  field: FieldInputProps<Value>;
  // if ppl want to restrict this for a given form, let them.
  form: FormikProps<Values>;
}

/**
 * Passed to `render={Function}` or `children={Function}`.
 */
export type FieldRenderProps<Values = any, Value = any> =
  LegacyBag<Values, Value> & {
    meta: FieldMetaProps<Value>;
  }

export type FieldRenderFunction<Values, Value> = (
  props: FieldRenderProps<Values, Value>
) => React.ReactElement | null;

/**
 * @deprecated Field types do not share common props. Please choose:
 *
 * FieldComponentProps: `field.component = Component`,
 * FieldAsProps: `field.as = Component`,
 * FieldRenderProps: `field.render, field.children = Function`
 */
export type FieldProps<Values, Path extends PathOf<Values>> =
  FieldRenderProps<Values, FieldValue<Values, Path>>;

export type TypedComponentField<Value> = <Values>(
  props: FieldComponentProps<Value, Values>
) => React.ReactElement | null;

/**
 * `field.as = string`
 *
 * @private
 */
export type FieldAsStringConfig<Values, Path extends PathOf<Values>, Value> =
  React.PropsWithChildren<{
    as: string,
    component?: undefined,
    render?: undefined,
  }>
    & FieldPassThroughConfig<Path, Value>
    & GenericFieldHTMLConfig;

export type FieldAsStringConfigByPath<Values, Path extends PathOf<Values>> =
  FieldAsStringConfig<Values, Path, FieldValue<Values, Path>>;
export type FieldAsStringConfigByValue<Values, Value> =
  FieldAsStringConfig<Values, PathMatchingValue<Values, Value>, Value>;

/**
 * `field.as = Component`
 *
 * @private
 */
export type FieldAsComponentConfig<
  Values,
  Path extends PathOf<Values>,
  Value
> =
  React.PropsWithChildren<
    {
      as: FieldAsComponent<Values, Value>;
      component?: undefined,
      render?: undefined,
    }
  >
    & FieldPassThroughConfig<Path, Value>;

export type FieldAsComponentConfigByPath<Values, Path extends PathOf<Values>> =
  FieldAsComponentConfig<Values, Path, FieldValue<Values, Path>>;
export type FieldAsComponentConfigByValue<Values, Value> =
  FieldAsComponentConfig<Values, PathMatchingValue<Values, Value>, Value>;

/**
 * `field.component = string`
 *
 * @private
 */
export type FieldStringComponentConfig<Values, Path extends PathOf<Values>, Value> =
  React.PropsWithChildren<{
    component: string,
    as?: undefined,
    render?: undefined,
  }>
    & FieldPassThroughConfig<Path, Value>
    & GenericFieldHTMLConfig;

export type FieldStringComponentConfigByPath<Values, Path extends PathOf<Values>> =
  FieldStringComponentConfig<Values, Path, FieldValue<Values, Path>>;
export type FieldStringComponentConfigByValue<Values, Value> =
  FieldStringComponentConfig<Values, PathMatchingValue<Values, Value>, Value>;

/**
 * `field.component = Component`
 *
 * @private
 */
export type FieldComponentConfig<
  Values,
  Path extends PathOf<Values>,
  Value
> =
  React.PropsWithChildren<
    {
      component: FieldComponentComponent<Values, Value>;
      as?: undefined,
      render?: undefined,
    }
  >
    & FieldPassThroughConfig<Path, Value>;

export type FieldComponentConfigByPath<Values, Path extends PathOf<Values>> =
  FieldComponentConfig<Values, Path, FieldValue<Values, Path>>;
export type FieldComponentConfigByValue<Values, Value> =
  FieldComponentConfig<Values, PathMatchingValue<Values, Value>, Value>;

/**
 * `field.render = Function`
 *
 * @private
 */
export type FieldRenderConfig<Values, Path extends PathOf<Values>, Value> =
  {
    render: FieldRenderFunction<Values, Value>;
    as?: undefined,
    component?: undefined,
    children?: undefined
  } & FieldPassThroughConfig<Path, Value>;

export type FieldRenderConfigByPath<Values, Path extends PathOf<Values>> =
  FieldRenderConfig<Values, Path, FieldValue<Values, Path>>;
export type FieldRenderConfigByValue<Values, Value> =
  FieldRenderConfig<Values, PathMatchingValue<Values, Value>, Value>;

/**
 * `field.children = Function`
 *
 * @private
 */
export type FieldChildrenConfig<Values, Path extends PathOf<Values>, Value> =
  {
    children: FieldRenderFunction<Values, Value>;
    as?: undefined,
    component?: undefined,
    render?: undefined,
  } & FieldPassThroughConfig<Path, Value>;

export type FieldChildrenConfigByPath<Values, Path extends PathOf<Values>> =
  FieldChildrenConfig<Values, Path, FieldValue<Values, Path>>;
export type FieldChildrenConfigByValue<Values, Value> =
  FieldChildrenConfig<Values, PathMatchingValue<Values, Value>, Value>;

/**
 * no config, `<Field name="">`
 *
 * @private
 */
export type FieldDefaultConfig<Values, Path extends PathOf<Values>, Value> =
  {
    as?: undefined,
    component?: undefined,
    render?: undefined,
    children?: undefined,
  }
    & FieldPassThroughConfig<Path, Value>
    & GenericFieldHTMLConfig;

export type FieldDefaultConfigByPath<Values, Path extends PathOf<Values>> =
  FieldDefaultConfig<Values, Path, FieldValue<Values, Path>>;
export type FieldDefaultConfigByValue<Values, Value> =
  FieldDefaultConfig<Values, PathMatchingValue<Values, Value>, Value>;

export type FieldConfigByValue<Values, Value> =
  FieldAsStringConfigByValue<Values, Value> |
  FieldAsComponentConfigByValue<Values, Value> |
  FieldStringComponentConfigByValue<Values, Value> |
  FieldComponentConfigByValue<Values, Value> |
  FieldRenderConfigByValue<Values, Value> |
  FieldChildrenConfigByValue<Values, Value> |
  FieldDefaultConfigByValue<Values, Value>;

export type FieldConfigByPath<Values, Path extends PathOf<Values>> =
  FieldAsStringConfigByPath<Values, Path> |
  FieldAsComponentConfigByPath<Values, Path> |
  FieldStringComponentConfigByPath<Values, Path> |
  FieldComponentConfigByPath<Values, Path> |
  FieldRenderConfigByPath<Values, Path> |
  FieldChildrenConfigByPath<Values, Path> |
  FieldDefaultConfigByPath<Values, Path>;

export type FieldConfig<Values, Path extends PathOf<Values>, Value> =
  FieldConfigByValue<Values, Value> | FieldConfigByPath<Values, Path>;

/**
 * @deprecated use `FieldConfig`
 */
export type FieldAttributes<Values, Path extends PathOf<Values>, Value> =
  FieldConfig<Values, Path, Value>;

export function Field<
  Values = any,
  Path extends PathOf<Values> = any,
  Value = any,
>(
  _rawProps: FieldConfig<Values, Path, Value>
) {
  //
  // We accept FieldConfigByValue, but we cast it to FieldConfigByPath internally because
  // TypeScript cannot connect the dots.
  //
  // If Typescript could compare the following, we wouldn't need this:
  // Value === FieldValue<Values, PathMatchingValue<Values, Value>>
  // number === number
  //
  const configAsPath = _rawProps as FieldConfigByPath<Values, Path>;

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !configAsPath.render,
        `<Field render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Field name="${configAsPath.name}" render={({field, form}) => ...} /> with <Field name="${configAsPath.name}">{({field, form, meta}) => ...}</Field>`
      );

      invariant(
        !(configAsPath.as && configAsPath.children && isFunction(configAsPath.children)),
        'You should not use <Field as> and <Field children> as a function in the same <Field> component; <Field as> will be ignored.'
      );

      invariant(
        !(configAsPath.component && configAsPath.children && isFunction(configAsPath.children)),
        'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.'
      );

      invariant(
        !(
          configAsPath.render &&
          configAsPath.children &&
          // impossible type
          !isEmptyChildren((configAsPath as any).children)
        ),
        'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
      );
      // eslint-disable-next-line
    }, []);
  }

  const [field, meta] = useField(configAsPath);

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
    !!configAsPath.render || isFunction(configAsPath.children) || (!!configAsPath.component && typeof configAsPath.component !== 'string')
  );

  const form = {
      ...formikApi,
      ...formikConfig,
      ...formikState,
  };

  if (configAsPath.render) {
    return configAsPath.render({ field, form, meta });
  }

  if (isFunction(configAsPath.children)) {
    return configAsPath.children({ field, form, meta });
  }

  if (configAsPath.as && typeof configAsPath.as !== 'string') {
    // not sure why as !== string isn't removing FieldAsStringConfig
    const {
      render,
      component,
      as,
      children,
      ...fieldAsProps
    } = configAsPath;
    return React.createElement(
      as,
      { ...fieldAsProps, ...field } as any,
      children
    );
  }

  if (configAsPath.component && typeof configAsPath.component !== 'string') {
    // not sure why component !== string isn't removing FieldStringComponentConfig
    const {
      // render props
      render,
      children,
      as,
      component,
      ...componentProps
    } = configAsPath;

    // We don't pass `meta` for backwards compat
    return React.createElement(
      component,
      { field, form, ...componentProps },
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
  } = configAsPath;

  return React.createElement(
    configAsPath.as || configAsPath.component || "input",
    // field has FieldValue<> while HTML expects
    { ref: configAsPath.innerRef, ...field, ...htmlProps },
    children
  );
}
