import { useFormikContext } from '../FormikContext';
import { useMemo } from 'react';
import {
  defaultFormatFn,
  defaultParseFn,
  numberParseFn,
  selectFieldMetaByName,
} from '../helpers/field-helpers';
import { FieldHelperProps, FieldInputProps, FieldMetaProps, FormikState } from '../types';
import { useFormikState } from './useFormikState';
import { isInputEvent, isObject, isShallowEqual } from '../utils';
import { FieldHookConfig } from '../Field';

/**
 * Get props to spread to input elements, like `<input {...fieldProps} />`.
 *
 * Pass `FieldMetaProps` from useFieldMeta, so we don't subscribe twice.
 */
export const useFieldProps = <Val>(
    nameOrOptions: string | FieldHookConfig<Val>,
    fieldMeta: FieldMetaProps<Val>
  ): FieldInputProps<any> => {
    const {
      handleChange,
      handleBlur,
      setFieldValue,
      getValueFromEvent
    } = useFormikContext();
    const name = isObject(nameOrOptions) ? nameOrOptions.name : nameOrOptions;
    const valueState = fieldMeta.value;
    const touchedState = fieldMeta.touched;

    const field: FieldInputProps<any> = {
      name,
      value: valueState,
      onChange: handleChange,
      onBlur: handleBlur,
    };

    if (isObject(nameOrOptions)) {
      const {
        type = "text",
        value: valueProp, // value is special for checkboxes
        as: is,
        multiple,
        parse = /number|range/.test(type) ? numberParseFn : defaultParseFn,
        format = defaultFormatFn,
        formatOnBlur = false,
      } = nameOrOptions;

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
            field.value = format(field.value, field.name);
          }
        } else {
          field.value = format(field.value, field.name);
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
            setFieldValue(name, parse(getValueFromEvent(eventOrValue, name), field.name));
          } else {
            setFieldValue(name, parse(eventOrValue, field.name));
          }
        };
      }
    }

    return field;
};

/**
 * Get field state from `FormikState`.
 */
export const useFieldMeta = <Value>(name: string): FieldMetaProps<Value> => {
  const [fieldMeta] = useFormikState(
    useMemo(() => selectFieldMetaByName(name), [name]),
    isShallowEqual
  );

  return fieldMeta;
};

/**
 * Get memoized helpers from `FormikContext`.
 */
export const useFieldHelpers = (name: string): FieldHelperProps<any> => {
  const { setFieldValue, setFieldTouched, setFieldError } = useFormikContext();
  return useMemo(() => ({
    setValue: (value: any, shouldValidate?: boolean) =>
      setFieldValue(name, value, shouldValidate),
    setTouched: (value: boolean, shouldValidate?: boolean) =>
      setFieldTouched(name, value, shouldValidate),
    setError: (value: any) => setFieldError(name, value),
  }), [name, setFieldValue, setFieldTouched, setFieldError]);
}

const selectIsDirty = (state: FormikState<any>) => state.dirty;
export const useIsDirty = () => useFormikContext().useState(selectIsDirty);

const selectIsValid = (state: FormikState<any>) => state.isValid;
export const useIsValid = () => useFormikContext().useState(selectIsValid);
