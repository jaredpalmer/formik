import { useMemo } from 'react';
import { useFormikContext } from '../FormikContext';
import {
  defaultFormatFn,
  selectFieldMetaByName,
  selectFieldOnChange,
} from '../helpers/field-helpers';
import {
  FieldHelperProps,
  FieldInputProps,
  FieldMetaProps,
  FormikState,
} from '../types';
import { useFormikState } from './useFormikState';
import { isObject, isShallowEqual } from '../utils';
import { PathMatchingValue, SingleValue } from '../types';
import { FieldHookConfig } from '../Field.types';

/**
 * Get props to spread to input elements, like `<input {...fieldProps} />`.
 *
 * Pass `FieldMetaProps` from useFieldMeta, so we don't subscribe twice.
 */export const useFieldProps = <Value, Values>(
  nameOrOptions: PathMatchingValue<Value, Values> |
  FieldHookConfig<Value, Values>,
fieldMeta: FieldMetaProps<Value>
): FieldInputProps<Value, Values> => {
  const {
    handleChange,
    handleBlur,
    setFieldValue,
    getState
  } = useFormikContext<Values>();
  const name = isObject(nameOrOptions) ? nameOrOptions.name : nameOrOptions;
  const valueState = fieldMeta.value;
  const touchedState = fieldMeta.touched;

  const field: FieldInputProps<Value, Values> = {
    name,
    // if this isn't a singular value, it should be parsed!
    // however, this is a fallback
    value: valueState as SingleValue<Value>,
    // handleChange isn't a match for onChange for custom value types
    // however, this is a fallback
    onChange: handleChange as any,
    onBlur: handleBlur,
  };

  if (isObject(nameOrOptions)) {
    const {
      type = 'text',
      value: valueProp, // value is special for checkboxes
      as: is,
      multiple,
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
      field.checked = valueState === valueProp!;
      // we need to force value on radio and multi-checkbox
      field.value = valueProp!;
    } else if (is === 'select' && multiple) {
      field.value = (field.value || []) as any;
      field.multiple = true;
    }

    if (format) {
      if (formatOnBlur === true) {
        if (touchedState === true) {
          field.value = format(field.value, field.name);
        }
      } else {
        field.value = format(field.value, field.name);
      }
    }

    field.onChange = selectFieldOnChange({ setFieldValue, getState }, nameOrOptions);
  }

  return field;
};

/**
 * Get field state from `FormikState`.
 */
export const useFieldMeta = <Value>(name: string): FieldMetaProps<Value> => {
  const [fieldMeta] = useFormikState<any, FieldMetaProps<Value>>(
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
  return useMemo(
    () => ({
      setValue: (value: any, shouldValidate?: boolean) =>
        setFieldValue(name, value, shouldValidate),
      setTouched: (value: boolean, shouldValidate?: boolean) =>
        setFieldTouched(name, value, shouldValidate),
      setError: (value: any) => setFieldError(name, value),
    }),
    [name, setFieldValue, setFieldTouched, setFieldError]
  );
};

const selectInitialValues = <Values>(state: FormikState<Values>) =>
  state.initialValues;
export const useInitialValues = <Values>() =>
  useFormikContext<Values>().useState(selectInitialValues);

const selectInitialTouched = <Values>(state: FormikState<Values>) =>
  state.initialTouched;
export const useInitialTouched = <Values>() =>
  useFormikContext<Values>().useState(selectInitialTouched);

const selectInitialErrors = <Values>(state: FormikState<Values>) =>
  state.initialErrors;
export const useInitialErrors = <Values>() =>
  useFormikContext<Values>().useState(selectInitialErrors);

const selectInitialStatus = (state: FormikState<any>) => state.initialStatus;
export const useInitialStatus = () =>
  useFormikContext().useState(selectInitialStatus);

const selectValues = <Values>(state: FormikState<Values>) => state.values;
export const useValues = <Values>() =>
  useFormikContext<Values>().useState(selectValues);

const selectTouched = <Values>(state: FormikState<Values>) => state.touched;
export const useTouched = <Values>() =>
  useFormikContext<Values>().useState(selectTouched);

const selectErrors = <Values>(state: FormikState<Values>) => state.errors;
export const useErrors = <Values>() =>
  useFormikContext<Values>().useState(selectErrors);

const selectStatus = (state: FormikState<any>) => state.status;
export const useStatus = () => useFormikContext().useState(selectStatus);

const selectIsDirty = (state: FormikState<any>) => state.dirty;
export const useIsDirty = () => useFormikContext().useState(selectIsDirty);

const selectIsValid = (state: FormikState<any>) => state.isValid;
export const useIsValid = () => useFormikContext().useState(selectIsValid);

const selectIsSubmitting = (state: FormikState<any>) => state.isSubmitting;
export const useIsSubmitting = () =>
  useFormikContext().useState(selectIsSubmitting);
