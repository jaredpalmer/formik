import { FieldHookConfig, FormikApi, FormikReducerState, InputElements } from '../types';
import { getIn, getValueFromEvent, isInputEvent, isObject } from '../utils';

/**
 * @internal
 *
 * Get FieldMetaProps from state.
 */
export const selectFieldMetaByName = <Values>(name: string) => (
  state: Pick<
    FormikReducerState<Values>,
    | 'values'
    | 'errors'
    | 'touched'
    | 'initialValues'
    | 'initialTouched'
    | 'initialErrors'
  >
) => ({
  value: getIn(state.values, name),
  error: getIn(state.errors, name),
  touched: !!getIn(state.touched, name),
  initialValue: getIn(state.initialValues, name),
  initialTouched: !!getIn(state.initialTouched, name),
  initialError: getIn(state.initialErrors, name),
});

export const defaultParseFn = (value: unknown, _name: string) => value;

export const numberParseFn = (value: any, _name: string) => {
  const parsed = parseFloat(value);

  return isNaN(parsed) ? '' : parsed;
};

export const defaultFormatFn = (value: unknown, _name: string) =>
  value === undefined ? '' : value;

export const selectFieldOnChange = <Value, Values>(
  {
    setFieldValue,
    getState,
  }: Pick<FormikApi<Values>, 'setFieldValue' | 'getState'>,
  nameOrConfig?: string | FieldHookConfig<Value>
) => {
  return (
    eventOrValue: React.ChangeEvent<React.ElementRef<InputElements>> | unknown
  ) => {
    const {
      type = '',
      name = '',
      parse: configParse,
      multiple,
    }: FieldHookConfig<Value> = isObject(nameOrConfig)
      ? nameOrConfig
      : isInputEvent(eventOrValue) && eventOrValue.target
      ? (eventOrValue.target as any)
      : { name: nameOrConfig! };

    if (isInputEvent(eventOrValue)) {
      if (eventOrValue.persist) {
        eventOrValue.persist();
      }
    }

    const value = isInputEvent(eventOrValue)
      ? getValueFromEvent(eventOrValue)
      : eventOrValue;

    const defaultParse = /number|range/.test(type)
      ? numberParseFn
      : // radios and checkboxes don't have a default parser
      // the default parser won't work for grouped fields
      !/radio|checkbox/.test(type)
      ? defaultParseFn
      : undefined;

    const parse = configParse ?? defaultParse;
    const parsedValue = parse ? parse(value, name) : value;

    setFieldValue(
      name,
      /checkbox/.test(type) &&
        isInputEvent(eventOrValue) &&
        eventOrValue.target instanceof HTMLInputElement
        ? getValueForCheckbox(
            getIn(getState().values, name!),
            eventOrValue.target.checked,
            parsedValue
          )
        : multiple && isInputEvent(eventOrValue) && eventOrValue.target instanceof HTMLSelectElement // <select multiple>
          ? getSelectedValues(eventOrValue.target.options)
          : parsedValue
    );
  };
};

/** Return multi select values based on an array of options */
export function getSelectedValues(options: HTMLOptionsCollection) {
  const result = [];
  if (options) {
    for (let index = 0; index < options.length; index++) {
      const option = options[index];
      if (option.selected) {
        result.push(option.value);
      }
    }
  }
  return result;
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
