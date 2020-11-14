import * as React from 'react';
import invariant from 'tiny-warning';
import {
  FieldInputProps,
  FieldMetaProps,
  FieldValidator,
  FormikContextType,
} from './types';
import { useFormikContextSelector } from './FormikContext';
import {
  defaultFormatFn,
  defaultParseFn,
  getIn,
  getValueFromEvent,
  isInputEvent,
  isObject,
  numberParseFn,
} from './utils';
import { FieldHelperProps } from './types';

export type UseFieldProps<V = any> = {
  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | string
    | React.ComponentType<FieldInputProps<V>>
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
   * HTML multiple attribute
   */
  multiple?: boolean;
  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: any;
};

export function useField<FieldValues = any>(
  nameOrOptions: string | UseFieldProps<FieldValues>
): [
  FieldInputProps<FieldValues>,
  FieldMetaProps<FieldValues>,
  FieldHelperProps<FieldValues>
] {
  const isAnObject = isObject(nameOrOptions);
  // Normalize propsOrFieldName to FieldConfig<Value>
  const props: UseFieldProps<FieldValues> = isAnObject
    ? (nameOrOptions as UseFieldProps<FieldValues>)
    : ({ name: nameOrOptions as string } as UseFieldProps<FieldValues>);

  const { name: fieldName, validate: validateFn } = props;

  const registerField = useFormikContextSelector(c => c.registerField);

  const unregisterField = useFormikContextSelector(c => c.unregisterField);

  React.useEffect(() => {
    invariant(
      fieldName,
      'Invalid field name. Either pass `useField` a string or an object containing a `name` key.'
    );

    invariant(
      registerField,
      'useField() / <Field /> must be used underneath a <Formik> component or withFormik() higher order component'
    );

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

  const meta = useFieldMeta(fieldName);
  const { value: valueState, touched: touchedState } = meta;
  const setFieldValue = useFormikContextSelector(ctx => ctx.setFieldValue);
  const handleChange = useFormikContextSelector(ctx => ctx.handleChange);
  const handleBlur = useFormikContextSelector(ctx => ctx.handleBlur);
  const getFieldHelpers = useFormikContextSelector(ctx => ctx.getFieldHelpers);

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
  } = nameOrOptions as UseFieldProps<FieldValues>; // @todo why is this type failing?

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

  return [field, meta, getFieldHelpers(fieldName)];
}

/**
 * Returns the value and an updater function of a given field
 * @param name The name of the field
 * @public
 */
export function useFieldValue<Values>(
  name: string
): [any | undefined, (error: any) => void] {
  const state = useFormikContextSelector<Values>(ctx =>
    getIn(ctx.values, name)
  );

  const set = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setFieldValue']
  >(ctx => ctx.setFieldValue);

  const setState = React.useCallback(
    (value: any, shouldValidate?: boolean) => {
      set(name, value, shouldValidate);
    },
    [name]
  );

  return [state, setState];
}

/**
 * Returns error message state and an updater function of a given field
 * @param name The name of the field
 * @public
 */
export function useFieldError<Values>(
  name: string
): [any | undefined, (error: any) => void] {
  const state = useFormikContextSelector<Values, any | undefined>(ctx =>
    getIn(ctx.errors, name)
  );

  const set = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setFieldError']
  >(ctx => ctx.setFieldError);

  const setState = React.useCallback(
    (error: any) => {
      set(name, error);
    },
    [name]
  );

  return [state, setState];
}

/**
 * Returns touched state and updater function of a given field
 * @param name The name of the field
 * @public
 */
export function useFieldTouched<Values>(
  name: string
): [boolean, (error: any) => void] {
  const state = useFormikContextSelector<Values, boolean>(ctx =>
    Boolean(getIn(ctx.errors, name))
  );

  const set = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setFieldTouched']
  >(ctx => ctx.setFieldTouched);

  const setState = React.useCallback(
    (isTouched?: boolean, shouldValidate?: boolean) => {
      set(name, isTouched, shouldValidate);
    },
    [name]
  );

  return [state, setState];
}

/**
 * Returns initial value of a given field
 * @param name The name of the field
 * @public
 */
export function useFieldInitialValue<Values>(name: string) {
  return useFormikContextSelector<Values, any | undefined>(ctx =>
    getIn(ctx.initialValues, name)
  );
}

/**
 * Returns initial touched state of a given field
 * @param name The name of the field
 * @public
 */
export function useFieldInitialTouched<Values>(name: string) {
  return useFormikContextSelector<Values>(ctx =>
    Boolean(getIn(ctx.initialTouched, name))
  );
}

/**
 * Returns initial error message of a given field
 * @param name The name of the field
 * @public
 */
export function useFieldInitialError<Values>(name: string) {
  return useFormikContextSelector<Values>(ctx =>
    getIn(ctx.initialErrors, name)
  );
}

/**
 * Returns initial Formik values
 * @public
 */
export function useInitialValues<Values>() {
  return useFormikContextSelector<
    Values,
    FormikContextType<Values>['initialValues']
  >(ctx => ctx.initialValues);
}

/**
 * Returns initial Formik touched
 * @public
 */
export function useInitialTouched<Values>() {
  return useFormikContextSelector<
    Values,
    FormikContextType<Values>['initialTouched']
  >(ctx => ctx.initialTouched);
}

/**
 * Returns initial Formik errors
 * @public
 */
export function useInitialErrors<Values>() {
  return useFormikContextSelector<
    Values,
    FormikContextType<Values>['initialErrors']
  >(ctx => ctx.initialErrors);
}

/**
 * Returns initial Formik status
 * @public
 */
export function useInitialStatus<Values>() {
  return useFormikContextSelector<
    Values,
    FormikContextType<Values>['initialStatus']
  >(ctx => ctx.initialStatus);
}

/**
 * Returns Formik errors and updater function
 * @public
 */
export function useErrors<Values>() {
  const state = useFormikContextSelector<
    Values,
    FormikContextType<Values>['errors']
  >(ctx => ctx.errors);
  const update = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setErrors']
  >(ctx => ctx.setErrors);
  return [state, update];
}

/**
 * Returns Formik values and updater function
 * @public
 */
export function useValues<Values>() {
  const state = useFormikContextSelector<
    Values,
    FormikContextType<Values>['values']
  >(ctx => ctx.values);
  const update = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setValues']
  >(ctx => ctx.setValues);
  return [state, update];
}

/**
 * Returns Formik touched state and updater function
 * @public
 */
export function useTouched<Values>() {
  const state = useFormikContextSelector<
    Values,
    FormikContextType<Values>['touched']
  >(ctx => ctx.touched);
  const update = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setTouched']
  >(ctx => ctx.setTouched);
  return [state, update];
}

/**
 * Returns Formik status and updater function
 * @public
 */
export function useStatus<T>() {
  const state: T = useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['status']
  >(ctx => ctx.status);
  const update = useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['setStatus']
  >(ctx => ctx.setStatus);
  return [state, update];
}

function useFieldMeta<Values>(name: string) {
  const [value] = useFieldValue<Values>(name);
  const [touched] = useFieldTouched<Values>(name);
  const [error] = useFieldError<Values>(name);
  const initialValue = useFieldInitialValue<Values>(name);
  const initialTouched = useFieldInitialTouched<Values>(name);
  const initialError = useFieldInitialError<Values>(name);
  return {
    value,
    touched,
    error,
    initialValue,
    initialTouched,
    initialError,
  };
}
