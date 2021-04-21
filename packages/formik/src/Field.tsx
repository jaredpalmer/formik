import * as React from 'react';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FieldMetaProps,
  FieldHelperProps,
  FieldInputProps,
  FieldValidator,
  FieldValue,
  FieldName,
} from './types';
import { isFunction, isEmptyChildren, isObject } from './utils';
import invariant from 'tiny-warning';
import { useFieldHelpers, useFieldMeta, useFieldProps } from './hooks/hooks';
import { useFormikConfig, useFormikContext } from './FormikContext';
import { selectFullState } from './helpers/form-helpers';

export type FieldProps<Values = any, Path extends string = any> = {
  field: FieldInputProps<Values, Path>;
  // if ppl want to restrict this for a given form, let them.
  form: FormikProps<Values>;
  meta: FieldMetaProps<FieldValue<Values, Path>>;
}

/**
 * If ExtraProps is any, allow any props
 */
export type ExtraPropsOrAnyProps<ExtraProps> = (object extends ExtraProps ? Record<string, any> : ExtraProps);

type FieldAsPropsWithoutExtraProps<Values, Path extends string, ExtraProps> =
  FieldHookConfig<Values, Path, ExtraProps> &
  FieldInputProps<Values, Path>;

type FieldAsExtraProps = Omit<
  Record<string, any>,
  'as' | 'component' | 'render' | 'children' |
    keyof FieldAsPropsWithoutExtraProps<any, any, any>
>;

export type FieldAsProps<
  Values = any,
  Path extends string = any,
  ExtraProps extends FieldAsExtraProps = any
> = FieldAsPropsWithoutExtraProps<Values, Path, ExtraProps> &
    ExtraPropsOrAnyProps<ExtraProps>;

type FieldAsComponentConfig<
  Values,
  Path extends string,
  ExtraProps extends FieldAsExtraProps
> =
  React.PropsWithChildren<
    {
      as: React.ComponentType<
        FieldAsProps<Values, Path, ExtraProps>
      >,
      component?: undefined,
      render?: undefined,
    }
  > &
    FieldHookConfig<Values, Path, ExtraProps> &
    ExtraPropsOrAnyProps<ExtraProps>;

export type ParseFn<Value> = (value: unknown, name: string) => Value;
export type FormatFn<Value> = (value: Value, name: string) => any;

export type FieldHookConfig<Values, Path extends string, ExtraProps = any> = {
  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | string
    | React.ComponentType<
        FieldAsProps<Values, Path, ExtraProps>
      >;

  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator<FieldValue<Values, Path>>;

  /**
   * Function to parse raw input value before setting it to state
   */
  parse?: ParseFn<FieldValue<Values, Path>>;

  /**
   * Function to transform value passed to input
   */
  format?: FormatFn<FieldValue<Values, Path>>;

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
  name: FieldName<Values, Path>;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: FieldValue<Values, Path>;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export function useField<Values = any, Path extends string = any, ExtraProps = any>(
  propsOrFieldName: FieldName<Values, Path> | FieldHookConfig<Values, Path, ExtraProps>
): [FieldInputProps<Values, Path>, FieldMetaProps<FieldValue<Values, Path>>, FieldHelperProps<FieldValue<Values, Path>>] {
  const formik = useFormikContext<Values>();
  const {
    registerField,
    unregisterField,
  } = formik;

  const props = isObject(propsOrFieldName)
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

/**
 * field.as = string
 */
type FieldAsStringConfig<Values, Path extends string, ExtraProps> =
  React.PropsWithChildren<
    {
      as: string,
      component?: undefined,
      render?: undefined,
    }
  > &
    FieldHookConfig<Values, Path, ExtraProps> &
    GenericFieldHTMLAttributes;

/**
 * field.component = string
 */
type FieldStringComponentConfig<Values, Path extends string> =
  React.PropsWithChildren<
    {
      as?: undefined,
      component: string,
      render?: undefined,
    }
  > &
    FieldHookConfig<Values, Path, {}> &
    GenericFieldHTMLAttributes;

/**
 * field.component = Component
 */
type LegacyBag<Values, Path extends string> = {
  field: FieldInputProps<Values, Path>;
  // if ppl want to restrict this for a given form, let them.
  form: FormikProps<Values>;
}

type FieldComponentPropsWithoutExtraProps<Values, Path extends string, ExtraProps> =
  FieldHookConfig<Values, Path, ExtraProps> &
  LegacyBag<Values, Path>;

type FieldComponentExtraProps = Omit<
  Record<string, any>,
  'as' | 'component' | 'render' | 'children' |
    keyof FieldComponentPropsWithoutExtraProps<any, any, any>
>;

export type FieldComponentProps<
  Values = any,
  Path extends string = any,
  ExtraProps extends FieldComponentExtraProps = any
> = FieldComponentPropsWithoutExtraProps<Values, Path, ExtraProps> &
  ExtraPropsOrAnyProps<ExtraProps>;

type FieldComponentConfig<
  Values,
  Path extends string,
  ExtraProps extends FieldComponentExtraProps
> =
  React.PropsWithChildren<
    {
      as?: undefined,
      component: React.ComponentType<
        FieldComponentProps<Values, Path, ExtraProps>
      >,
      render?: undefined,
    }
  > &
      FieldHookConfig<Values, Path, ExtraProps> &
      ExtraPropsOrAnyProps<ExtraProps>;

/**
 * field.render = Function
 */
type FieldRenderFunction<Values, Path extends string> = (
  props: FieldProps<Values, Path>
) => React.ReactElement | null;

type FieldRenderConfig<Values, Path extends string> = {
  as?: undefined,
  component?: undefined,
  render: FieldRenderFunction<Values, Path>;
  children?: undefined
} & FieldHookConfig<Values, Path>;

/**
 * field.children = Function
 */
type FieldChildrenConfig<Values, Path extends string> = {
  as?: undefined,
  component?: undefined,
  render?: undefined,
  children: FieldRenderFunction<Values, Path>;
} & FieldHookConfig<Values, Path>;

/**
 * no config, <Field name="">
 */
type FieldDefaultConfig<Values, Path extends string> =
  React.PropsWithChildren<
    {
      as?: undefined,
      component?: undefined,
      render?: undefined,
    }
  > &
    FieldHookConfig<Values, Path> &
    GenericFieldHTMLAttributes;

export type FieldConfig<Values, Path extends string, ExtraProps = any> =
  FieldAsStringConfig<Values, Path, ExtraProps> |
  FieldAsComponentConfig<Values, Path, ExtraProps> |
  FieldStringComponentConfig<Values, Path> |
  FieldComponentConfig<Values, Path, ExtraProps> |
  FieldRenderConfig<Values, Path> |
  FieldChildrenConfig<Values, Path> |
  FieldDefaultConfig<Values, Path>;

export type FieldAttributes<Values, Path extends string, ExtraProps = any> =
  FieldConfig<Values, Path, ExtraProps>;

/**
 * FieldConfig Tests
 */
let configTest: FieldConfig<any, any, { what: true }> | undefined = undefined;
// AsString
const fieldAsString: FieldAsStringConfig<any, any, any> = {} as any;
fieldAsString.as = 'input';
fieldAsString.onInput = (event) => {};
configTest = {
  as: "input",
  name: '',
  onInput: (e) => {},
};
// AsComponent
const fieldAsConfig: FieldAsComponentConfig<any, any, { what: true }> = {} as any;
fieldAsConfig.as = (props) => props.what && null;
configTest = {
  as: fieldAsConfig.as,
  name: '',
  what: true,
};
// AsComponent + Extra
const fieldAsExtraConfig: FieldAsComponentConfig<any, any, { what: true }> = {} as any;
fieldAsExtraConfig.as = (props) => props.what && null;
configTest = {
  as: fieldAsExtraConfig.as,
  name: '',
  what: true,
};
// StringComponent
const fieldStringComponent: FieldStringComponentConfig<any, any> = {} as any;
fieldStringComponent.component = 'input';
fieldStringComponent.onInput = (event) => {};
configTest = {
  component: "input",
  name: '',
}
// ComponentComponent
const fieldComponentConfig: FieldComponentConfig<any, any, { what: true }> = {} as any;
fieldComponentConfig.component = (props) => props.what && props.field.value ? null : null;

// ComponentComponent
configTest = {
  component: fieldComponentConfig.component,
  name: '',
  what: true,
};

// ComponentComponent
const fieldComponentWithExtraConfig: FieldComponentConfig<any, any, { what: true }> = {} as any;
fieldComponentWithExtraConfig.component = (props) => props.what && props.field.value ? null : null;

const fieldComponentWithExtra: FieldComponentConfig<any, any, { what: true }> = {} as any;
fieldComponentWithExtra.component = (props) => props.what && null;
configTest = {
  component: fieldComponentWithExtra.component,
  name: '',
  what: true,
};

// RenderFunction
const fieldRenderConfig: FieldRenderConfig<any, any> = {} as any;
fieldRenderConfig.render = (props) => !!props.field.onChange && null;
configTest = {
  name: '',
  render: fieldRenderConfig.render,
};
// ChildrenFunction
const fieldChildrenConfig: FieldChildrenConfig<any, any> = {} as any;
fieldChildrenConfig.children = (props) => !!props.field.onChange && null
configTest = {
  name: '',
  children: fieldChildrenConfig.children,
};
// DefaultConfig
configTest = {
  name: '',
};
const proplessComponent = () => null;
const propsAnyComponent = (props: any) => props ? null : null;
const asComponent = (props: FieldAsProps<any, any>) => !!props.onChange && null;
const asComponentWithExtra = (props: FieldAsProps<any, any, { what: true }>) => !!props.onChange && null;
const asComponentWithOnlyExtra = (props: { what: true }) => !!props.what ? null : null;
const componentComponent = (props: FieldComponentProps<any, any>) => !!props.field.onChange && null;
const componentWithExtra = (props: FieldComponentProps<any, any, { what: true }>) => !!props.field.onChange && null;
const componentWithOnlyExtra = (props: { what: true }) => !!props.what ? null : null;
const renderFunction: FieldRenderFunction<any, any> = (props) => props.meta.value ? null : null;

const formTests = (props: FieldConfig<any, any, {what: true}>) =>
  <>
    <input onInput={event => {}} />
    {/* FieldAsString */}
    <Field name="test" as="select" onInput={event => {}} />
    {/* FieldAsComponent */}
    <Field name="test" as={proplessComponent} />
    <Field name="test" as={propsAnyComponent} />
    <Field name="test" as={propsAnyComponent} what={true} />
    {/* @ts-expect-error */}
    <Field name="test" as={proplessComponent} what={true} />
    <Field name="test" as={asComponent} />
    <Field name="test" as={asComponentWithExtra} what={true} />
    {/* @ts-expect-error */}
    <Field name="test" as={asComponentWithExtra} what={false} />
    <Field name="test" as={asComponentWithOnlyExtra} what={true} />
    {/* @ts-expect-error */}
    <Field name="test" as={asComponentWithOnlyExtra} what={false} />
    {/* FieldStringComponent */}
    <Field name="test" component="select" what={true} onInput={event => {}} />
    {/* FieldComponent */}
    <Field name="test" component={proplessComponent} />
    <Field name="test" component={propsAnyComponent} />
    <Field name="test" component={propsAnyComponent} what={true} />
    {/* @ts-expect-error */}
    <Field name="test" component={proplessComponent} what={true} />
    <Field name="test" component={componentComponent} />
    <Field name="test" component={componentWithExtra} what={true} />
    {/* @ts-expect-error */}
    <Field name="test" component={componentWithExtra} what={false} />
    <Field name="test" component={componentWithOnlyExtra} what={true} />
    {/* @ts-expect-error */}
    <Field name="test" component={componentWithOnlyExtra} what={false} />
    {/* FieldRender */}
    <Field name="test" render={renderFunction} />
    {/* FieldChildren */}
    <Field name="test" children={renderFunction} />
    <Field name="test">{renderFunction}</Field>
    {/* Default */}
    <Field name="test" onInput={event => {}} />

    {/* Pass-Through Props */}
    <Field<any, any, {what: true}> {...props} />
    <Field {...props} />
    {/* @ts-expect-error */}
    <Field<any, any, {what: false}> {...props} />
  </>

export function Field<
  Values = any,
  Path extends string = any,
  ExtraProps = any
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
    props.render || props.component || "input",
    // field has FieldValue<> while HTML expects
    { ...field, ...htmlProps, ref: props.innerRef } as any,
    children
  );
}
