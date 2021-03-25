import { useMemo } from 'react';
import { useFormikContext } from '../FormikContext';
import {
  selectFieldMetaByName,
} from '../helpers/field-helpers';
import {
  FieldMetaProps,
  FormikState,
} from '../types';
import { useFormikState } from './useFormikState';
import { isShallowEqual } from '../utils';

/**
 * Returns @see FieldMetaProps<Value>
 */
export const useFieldMeta = <Value>(name: string): FieldMetaProps<Value> => {
  const [fieldMeta] = useFormikState(
    useMemo(() => selectFieldMetaByName(name), [name]),
    isShallowEqual
  );

  return fieldMeta;
};

const selectInitialValues = <Values>(state: FormikState<Values>) => state.initialValues;
export const useInitialValues = <Values>() => useFormikContext<Values>().useState(selectInitialValues);

const selectInitialTouched = <Values>(state: FormikState<Values>) => state.initialTouched;
export const useInitialTouched = <Values>() => useFormikContext<Values>().useState(selectInitialTouched);

const selectInitialErrors = <Values>(state: FormikState<Values>) => state.initialErrors;
export const useInitialErrors = <Values>() => useFormikContext<Values>().useState(selectInitialErrors);

const selectInitialStatus = (state: FormikState<any>) => state.initialStatus;
export const useInitialStatus = () => useFormikContext().useState(selectInitialStatus);

const selectValues = <Values>(state: FormikState<Values>) => state.values;
export const useValues = <Values>() => useFormikContext<Values>().useState(selectValues);

const selectTouched = <Values>(state: FormikState<Values>) => state.touched;
export const useTouched = <Values>() => useFormikContext<Values>().useState(selectTouched);

const selectErrors = <Values>(state: FormikState<Values>) => state.errors;
export const useErrors = <Values>() => useFormikContext<Values>().useState(selectErrors);

const selectStatus = (state: FormikState<any>) => state.status;
export const useStatus = () => useFormikContext().useState(selectStatus);

const selectIsDirty = (state: FormikState<any>) => state.dirty;
export const useIsDirty = () => useFormikContext().useState(selectIsDirty);

const selectIsValid = (state: FormikState<any>) => state.isValid;
export const useIsValid = () => useFormikContext().useState(selectIsValid);

const selectIsSubmitting = (state: FormikState<any>) => state.isSubmitting;
export const useIsSubmitting = () => useFormikContext().useState(selectIsSubmitting);
