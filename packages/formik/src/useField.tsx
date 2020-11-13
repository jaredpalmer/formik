import * as React from 'react';
import invariant from 'tiny-warning';
import { FieldInputProps, FieldMetaProps, FieldValidator } from './types';
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

export function useFieldValue(name: string) {
  return useFormikContextSelector(ctx => getIn(ctx.values, name));
}

export function useFieldError(name: string) {
  return useFormikContextSelector(ctx => getIn(ctx.errors, name));
}

export function useFieldTouched(name: string) {
  return useFormikContextSelector(ctx => Boolean(getIn(ctx.touched, name)));
}

export function useFieldInitialValue(name: string) {
  return useFormikContextSelector(ctx =>
    getIn(ctx.initialValues.current, name)
  );
}

export function useFieldInitialTouched(name: string) {
  return useFormikContextSelector(
    ctx => !!getIn(ctx.initialTouched.current, name)
  );
}

export function useFieldInitialError(name: string) {
  return useFormikContextSelector(ctx =>
    getIn(ctx.initialErrors.current, name)
  );
}

function useFieldMeta(name: string) {
  return {
    value: useFieldValue(name),
    touched: useFieldTouched(name),
    error: useFieldError(name),
    initialValue: useFieldInitialValue(name),
    initialTouched: useFieldInitialTouched(name),
    initialError: useFieldInitialError(name),
  };
}
