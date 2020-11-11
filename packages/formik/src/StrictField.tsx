import * as React from 'react';
import { useContextSelector } from 'use-context-selector';
import { FormikContext } from './FormikContext';
import invariant from 'tiny-warning';
import {
  FieldInputProps,
  FieldMetaProps,
  FieldValidator,
  FormikContextType,
  GenericFieldHTMLAttributes,
} from './types';
import {
  defaultFormatFn,
  defaultParseFn,
  getIn,
  getValueFromEvent,
  isInputEvent,
  isObject,
  numberParseFn,
  isFunction,
  isEmptyChildren,
} from './utils';

export function unstable_useFieldValue(name: string) {
  return useContextSelector(FormikContext, ctx => getIn(ctx.values, name));
}

export function unstable_useFieldError(name: string) {
  return useContextSelector(FormikContext, ctx => getIn(ctx.errors, name));
}

export function unstable_useFieldTouched(name: string) {
  return useContextSelector(FormikContext, ctx => getIn(ctx.touched, name));
}

function useFieldState(name: string) {
  return {
    value: unstable_useFieldValue(name),
    touched: unstable_useFieldTouched(name),
    error: unstable_useFieldError(name),
    initialValue: useContextSelector(FormikContext, ctx =>
      getIn(ctx.initialValues.current, name)
    ),
    initialTouched: useContextSelector(
      FormikContext,
      ctx => !!getIn(ctx.initialTouched.current, name)
    ),
    initialError: useContextSelector(FormikContext, ctx =>
      getIn(ctx.initialErrors.current, name)
    ),
  };
}

export interface StrictFieldProps<V = any> {
  field: FieldInputProps<V>;
  meta: FieldMetaProps<V>;
}

export interface UseStrictFieldProps<V = any> {
  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | React.ComponentType<StrictFieldProps<V>['field']>
    | string
    | React.ComponentType
    | React.ForwardRefExoticComponent<any>;
  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator;

  /**
   * Function to parse raw input value before setting it to state
   */
  parse?: (value: unknown, name: string) => V;

  /**
   * Function to transform value passed to input
   */
  format?: (value: V, name: string) => any;

  /**
   * Wait until blur event before formatting input value?
   * @default false
   */
  formatOnBlur?: boolean;

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

export type StrictFieldAttributes<T> = GenericFieldHTMLAttributes &
  UseStrictFieldProps<T> &
  T & { name: string };
export type StrictFieldHookConfig<T> = GenericFieldHTMLAttributes &
  UseStrictFieldProps<T>;
export type StrictFieldConfig<V = any> = UseStrictFieldProps<V> & {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<StrictFieldProps<V>>
    | React.ComponentType
    | React.ForwardRefExoticComponent<any>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: StrictFieldProps<V>) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?:
    | ((props: StrictFieldProps<V>) => React.ReactNode)
    | React.ReactNode;
};

export function unstable_useField<Value = any>(
  nameOrOptions: string | StrictFieldHookConfig<Value>
): [FieldInputProps<Value>, FieldMetaProps<Value>] {
  const isAnObject = isObject(nameOrOptions);
  // Normalize propsOrFieldName to FieldConfig<Value>
  const props: StrictFieldConfig<Value> = isAnObject
    ? (nameOrOptions as StrictFieldConfig<Value>)
    : ({ name: nameOrOptions as string } as StrictFieldConfig<Value>);

  const { name: fieldName, validate: validateFn } = props;

  const registerField = useContextSelector(
    FormikContext,
    (c: FormikContextType<unknown>) => c.registerField
  );

  const unregisterField = useContextSelector(
    FormikContext,
    (c: FormikContextType<unknown>) => c.unregisterField
  );

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

  // const valueState = useFieldValue(fieldName);
  // const touchedState = useFieldTouched(fieldName);
  const meta = useFieldState(fieldName);
  const { value: valueState, touched: touchedState } = meta;
  const setFieldValue = useContextSelector(
    FormikContext,
    ctx => ctx.setFieldValue
  );
  const handleChange = useContextSelector(
    FormikContext,
    ctx => ctx.handleChange
  );
  const handleBlur = useContextSelector(FormikContext, ctx => ctx.handleBlur);

  const field: FieldInputProps<any> = {
    name: fieldName,
    value: valueState,
    // @todo extract into factory methods to use between formik and field
    onChange: handleChange,
    onBlur: handleBlur,
  };

  const {
    type,
    value: valueProp, // value is special for checkboxes
    as: is,
    multiple,
    parse = /number|range/.test(type ?? '') ? numberParseFn : defaultParseFn,
    format = defaultFormatFn,
    formatOnBlur = false,
  } = nameOrOptions as StrictFieldHookConfig<Value> & { multiple?: boolean }; // @todo why is this type failing?

  if (type === 'checkbox') {
    if (valueProp === undefined) {
      field.checked = !!valueState;
    } else {
      field.checked = !!(
        Array.isArray(valueState) && ~valueState.indexOf(valueProp)
      );
      field.value = valueProp;
    }
  } else if (type === 'radio') {
    field.checked = valueState === valueProp;
    field.value = valueProp;
  } else if (is === 'select' && multiple) {
    field.value = field.value || [];
    field.multiple = true;
  }

  if (type !== 'radio' && type !== 'checkbox' && !!format) {
    if (formatOnBlur === true) {
      if (touchedState === true) {
        field.value = format(field.value, fieldName);
      }
    } else {
      field.value = format(field.value, fieldName);
    }
  }

  // We incorporate the fact that we know the `name` prop by scoping `onChange`.
  // In addition, to support `parse` fn, we can't just re-use the OG `handleChange`, but
  // instead re-implement it's guts.
  if (type !== 'radio' && type !== 'checkbox') {
    field.onChange = (eventOrValue: React.ChangeEvent<any> | any) => {
      if (isInputEvent(eventOrValue)) {
        if (eventOrValue.persist) {
          eventOrValue.persist();
        }
        setFieldValue(
          fieldName,
          parse(getValueFromEvent(eventOrValue, valueState), fieldName)
        );
      } else {
        setFieldValue(fieldName, parse(eventOrValue, fieldName));
      }
    };
  }

  return [field, meta];
}

const useField = unstable_useField;

export function unstable_StrictField({
  render,
  children,
  as: is, // `as` is reserved in typescript lol
  component,
  ...props
}: StrictFieldAttributes<any>) {
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

  const [field, meta] = useField(props);

  if (render) {
    return render({ field, meta });
  }

  if (isFunction(children)) {
    return children({ field, meta });
  }

  const { innerRef, parse, format, formatOnBlur, validate, ...rest } = props;

  if (component) {
    // This behavior is backwards compat with earlier Formik 0.9 to 1.x
    if (typeof component === 'string') {
      return React.createElement(
        component,
        { ref: innerRef, ...field, ...rest },
        children
      );
    }
    return React.createElement(component, { field, meta, ...rest }, children);
  }

  // default to input here so we can check for both `as` and `children` above
  const asElement = is || 'input';

  if (typeof asElement === 'string') {
    return React.createElement(
      asElement,
      { ref: innerRef, ...field, ...rest },
      children
    );
  }
  return React.createElement(asElement, { ...field, ...rest }, children);
}
