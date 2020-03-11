import * as React from 'react';
import { FormikContext } from './FormikContext';
import {
  getIn,
  useEventCallback,
  isInputEvent,
  useStateAndRef,
  isReactNative,
} from './utils';
import { ValidatorFn, FieldStateAndOperations } from './types';

export interface UseFieldOptions<V> {
  name: string;
  validate?: ValidatorFn;
  initialValue?: V;
  type?: string;
  value?: any;
  as?: string;
  multiple?: boolean;
  /**
   * Function to parse raw input value before setting it to state
   */
  parse?: (value: unknown, name: string) => any;

  /**
   * Function to transform value passed to input
   */
  format?: (value: any, name: string) => any;

  /**
   * Wait until blur event before formatting input value?
   * @default false
   */
  formatOnBlur?: boolean;
}

/** Field input value, name, and event handlers */
export interface FieldInputProps<Value> {
  /** Value of the field */
  value: Value;
  /** Name of the field */
  name: string;
  /** Multiple select? */
  multiple?: boolean;
  /** Is the field checked? */
  checked?: boolean;
  /** Change event handler */
  onChange: (eventOrValue: React.SyntheticEvent | Value | undefined) => void;
  /** Blur event handler */
  onBlur: (eventOrValue: React.SyntheticEvent | boolean | undefined) => void;
}

export function useField<V = unknown>(
  options: UseFieldOptions<V>
): [FieldInputProps<V>, FieldStateAndOperations<V>] {
  const {
    name,
    validate,
    type,
    as: is, // as: "select"
    value: valueProp, // value is special for checkboxes
    multiple,
    parse = type && /number|range/.test(type) ? numberParseFn : defaultParseFn,
    format = defaultFormatFn,
    formatOnBlur = false,
  } = options;
  const {
    register,
    unregister,
    initialValues,
    forceUpdate,
    ...rest
  } = React.useContext(FormikContext);
  const [value, setValue, valueRef] = useStateAndRef(
    options.initialValue || getIn(initialValues, options.name) || ''
  );
  const [touched, setTouched, touchedRef] = useStateAndRef(false);
  const [error, setError, errorsRef] = useStateAndRef();
  React.useEffect(() => {
    register(name, {
      valueRef,
      touchedRef,
      errorsRef,
      setError,
      setValue,
      setTouched,
      validate,
    });
    return () => {
      unregister(name);
    };
  }, [
    name,
    validate,
    register,
    unregister,
    setValue,
    setTouched,
    setError,
    errorsRef,
    touchedRef,
    valueRef,
  ]);
  const getValueFromEvent = useEventCallback(
    (event: React.SyntheticEvent<any>) => {
      // React Native/Expo Web/maybe other render envs
      if (
        !isReactNative &&
        event.nativeEvent &&
        (event.nativeEvent as any).text !== undefined
      ) {
        return (event.nativeEvent as any).text;
      }
      // React Native
      if (isReactNative && event.nativeEvent) {
        return (event.nativeEvent as any).text;
      }
      const target = event.target ? event.target : event.currentTarget;
      const { type, value: valueProp, checked, options, multiple } = target;
      return /checkbox/.test(type) // checkboxes
        ? getValueForCheckbox(value, checked, valueProp)
        : !!multiple // <select multiple>
        ? getSelectedValues(options)
        : valueProp;
    }
  );
  const handleChange = useEventCallback(eventOrValue => {
    if (isInputEvent(eventOrValue)) {
      if (eventOrValue.persist) {
        eventOrValue.persist();
      }
      setValue(parse(getValueFromEvent(eventOrValue), name));
    } else {
      setValue(parse(eventOrValue, name));
    }
    if (validate) {
      const err = validate(eventOrValue.target.value);
      setError(err);
    }
    forceUpdate();
  });
  const handleBlur = useEventCallback(eventOrValue => {
    if (isInputEvent(eventOrValue)) {
      if (eventOrValue.persist) {
        eventOrValue.persist();
      }
      setTouched(true);
    } else {
      setTouched(eventOrValue);
    }
    if (validate) {
      setError(validate(eventOrValue.target.value));
    }
    forceUpdate();
  });
  let field: FieldInputProps<V> = {
    name,
    value,
    onChange: handleChange,
    onBlur: handleBlur,
  };
  if (type === 'checkbox') {
    if (valueProp === undefined) {
      field.checked = !!value;
    } else {
      field.checked = !!(Array.isArray(value) && ~value.indexOf(valueProp));
      field.value = valueProp;
    }
  } else if (type === 'radio') {
    field.checked = value === valueProp;
    field.value = valueProp;
  } else if (is === 'select' && multiple) {
    field.value = field.value || ([] as any);
    field.multiple = true;
  }
  if (type !== 'radio' && type !== 'checkbox' && !!format) {
    if (formatOnBlur === true) {
      if (touched === true) {
        field.value = format(field.value, name);
      }
    } else {
      field.value = format(field.value, name);
    }
  }
  return [
    field,
    { value, error, touched, setValue, setError, setTouched, validate },
  ];
}

/** Return multi select values based on an array of options */
export function getSelectedValues(options: any[]) {
  return Array.from(options)
    .filter(el => el.selected)
    .map(el => el.value);
}

/** Return the next value for a checkbox */
export function getValueForCheckbox(
  currentValue: string | any[],
  checked: boolean,
  valueProp: any
) {
  // If the current value was a boolean, return a boolean
  if (typeof currentValue === 'boolean') {
    return Boolean(checked);
  }

  // If the currentValue was not a boolean we want to return an array
  let currentArrayOfValues = [];
  let isValueInArray = false;
  let index = -1;

  if (!Array.isArray(currentValue)) {
    // eslint-disable-next-line eqeqeq
    if (!valueProp || valueProp == 'true' || valueProp == 'false') {
      return Boolean(checked);
    }
  } else {
    // If the current value is already an array, use it
    currentArrayOfValues = currentValue;
    index = currentValue.indexOf(valueProp);
    isValueInArray = index >= 0;
  }

  // If the checkbox was checked and the value is not already present in the aray we want to add the new value to the array of values
  if (checked && valueProp && !isValueInArray) {
    return currentArrayOfValues.concat(valueProp);
  }

  // If the checkbox was unchecked and the value is not in the array, simply return the already existing array of values
  if (!isValueInArray) {
    return currentArrayOfValues;
  }

  // If the checkbox was unchecked and the value is in the array, remove the value and return the array
  return currentArrayOfValues
    .slice(0, index)
    .concat(currentArrayOfValues.slice(index + 1));
}

export const defaultParseFn = (value: unknown, _name: string) => value;

export const numberParseFn = (value: any, _name: string) => {
  const parsed = parseFloat(value);

  return isNaN(parsed) ? '' : parsed;
};

export const defaultFormatFn = (value: unknown, _name: string) =>
  value === undefined ? '' : value;
