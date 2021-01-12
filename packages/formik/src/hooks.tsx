import * as React from 'react';
import invariant from 'tiny-warning';
import { useFormikContextSelector } from './FormikContext';
import {
  defaultFormatFn,
  defaultParseFn,
  FieldHelperProps,
  FieldInputProps,
  FieldMetaProps,
  FieldValidator,
  FormikContextType,
  getIn,
  isInputEvent,
  isObject,
  numberParseFn,
} from '@formik/core';

export type UseFieldProps<Value = any> = {
  /**
   * Component to render. Can either be a string e.g. 'select', 'input', or 'textarea', or a component.
   */
  as?:
    | string
    | React.ComponentType<FieldInputProps<Value>>
    | React.ComponentType
    | React.ForwardRefExoticComponent<any>;
  /**
   * Validate a single field value independently
   */
  validate?: FieldValidator;

  /**
   * Function to parse raw input value before setting it to state
   */
  parse?: (value: unknown, name: string) => Value;

  /**
   * Function to transform value passed to input
   */
  format?: (value: Value, name: string) => any;

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
  value?: Value;
};

/**
 * Returns Formik field value updater function
 * @public
 */
export function useSetFieldValue<
  Values
>(): FormikContextType<Values>['setFieldValue'] {
  return useFormikContextSelector<
    Values,
    FormikContextType<Values>['setFieldValue']
  >(ctx => ctx.setFieldValue);
}

/**
 * Returns Formik field touched updater function
 * @public
 */
export function useSetFieldTouched<
  Values
>(): FormikContextType<Values>['setFieldTouched'] {
  return useFormikContextSelector<
    Values,
    FormikContextType<Values>['setFieldTouched']
  >(ctx => ctx.setFieldTouched);
}

export function useField<Value = any, FieldValues = any>(
  nameOrOptions: string | UseFieldProps<Value>
): [
  FieldInputProps<Value>,
  FieldMetaProps<FieldValues>,
  FieldHelperProps<Value>
] {
  const isAnObject = isObject(nameOrOptions);
  // Normalize propsOrFieldName to FieldConfig<Value>
  const props: UseFieldProps<Value> = isAnObject
    ? (nameOrOptions as UseFieldProps<Value>)
    : ({ name: nameOrOptions as string } as UseFieldProps<Value>);

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
  const setFieldValue = useSetFieldValue();
  const setFieldTouched = useSetFieldTouched();
  const getFieldHelpers = useFormikContextSelector(ctx => ctx.getFieldHelpers);
  const getValueFromEvent = useFormikContextSelector(
    ctx => ctx.getValueFromEvent
  );

  const field: FieldInputProps<any> = {
    name: fieldName,
    value: valueState,
    // We incorporate the fact that we know the `name` prop by scoping `onChange` and `onBlur`.
    // In addition, to support `parse` fn, we can't just re-use the OG `handleChange` and `handleBlur`, but
    // instead re-implement it's guts.
    onChange: (eventOrValue: React.ChangeEvent<any> | any) => {
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
    },
    onBlur: (eventOrValue: React.SyntheticEvent<any> | boolean) => {
      if (isInputEvent(eventOrValue)) {
        if (eventOrValue.persist) {
          eventOrValue.persist();
        }
        setFieldTouched(fieldName, true);
      } else {
        setFieldValue(fieldName, eventOrValue);
      }
    },
  };

  const {
    type,
    value: valueProp, // value is special for checkboxes
    as: is,
    multiple,
    parse = /number|range/.test(type ?? '') ? numberParseFn : defaultParseFn,
    format = defaultFormatFn,
    formatOnBlur = false,
  } = nameOrOptions as UseFieldProps<Value>; // @todo why is this type failing?

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

  const set = useSetFieldValue<Values>();

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
    Boolean(getIn(ctx.touched, name))
  );

  const set = useSetFieldTouched<Values>();

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
 * Returns Formik touched updater function
 * @public
 */
export function useSetTouched<Values>() {
  const update = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setTouched']
  >(ctx => ctx.setTouched);
  return update;
}

/**
 * Returns Formik values updater function
 * @public
 */
export function useSetValues<Values>() {
  const update = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setValues']
  >(ctx => ctx.setValues);
  return update;
}

/**
 * Returns Formik errors updater function
 * @public
 */
export function useSetErrors<Values>() {
  const update = useFormikContextSelector<
    Values,
    FormikContextType<Values>['setErrors']
  >(ctx => ctx.setErrors);
  return update;
}

/**
 * Returns Formik status state and updater function
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

/**
 * Returns Formik status updater function
 * @public
 */
export function useSetStatus() {
  return useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['setStatus']
  >(ctx => ctx.setStatus);
}

/**
 * Returns a function to imperatively submit the form
 * @public
 */
export function useSubmitForm() {
  return useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['submitForm']
  >(ctx => ctx.submitForm);
}

/**
 * Returns whether the form submission is currently being attempted
 * @public
 */
export function useIsSubmitting() {
  return useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['isSubmitting']
  >(ctx => ctx.isSubmitting);
}

/**
 * Returns function to reset the form
 * @public
 */
export function useResetForm() {
  return useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['resetForm']
  >(ctx => ctx.resetForm);
}

/**
 *
 * Returns whether the form submission is currently being attempted
 * @public
 */
export function useIsValid() {
  return useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['isValid']
  >(ctx => ctx.isValid);
}

/**
 * Returns whether the form is dirty
 * @public
 */
export function useIsDirty() {
  return useFormikContextSelector<unknown, FormikContextType<unknown>['dirty']>(
    ctx => ctx.dirty
  );
}

/**
 * Returns a function to imperatively validate the entire form
 * @public
 */
export function useValidateForm() {
  return useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['validateForm']
  >(ctx => ctx.validateForm);
}

/**
 * Returns a function to imperatively validate a field
 * @public
 */
export function useValidateField(fieldName?: string) {
  const validateField = useFormikContextSelector<
    unknown,
    FormikContextType<unknown>['validateField']
  >(ctx => ctx.validateField);
  return React.useCallback(() => {
    return fieldName ? validateField(fieldName) : validateField;
  }, [fieldName]);
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
