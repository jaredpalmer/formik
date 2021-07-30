import { FieldHookConfig } from '../Field';
import { getSelectedValues, getValueForCheckbox } from '../Formik';
import { FormikApi, FormikReducerState, InputElements } from '../types';
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
