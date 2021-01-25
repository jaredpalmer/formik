import {
  FieldMetaProps,
  FormikErrors,
  FormikTouched,
  SetErrorsFn,
  SetTouchedFn,
  SetValuesFn,
} from '@formik/core';
import { selectFieldMetaByName } from '../ref-selectors';
import { FormikRefState } from '../types';
import { fieldMetaIsEqual } from './useField';
import { useFormikComputedState } from './useFormikComputedState';
import { useFormikState } from './useFormikState';

/**
 * Returns @see FieldMetaProps<Value>
 */
export const useFieldMeta = <Value,>(name: string): FieldMetaProps<Value> => {
  const [fieldMeta] = useFormikState(
    [selectFieldMetaByName, name],
    fieldMetaIsEqual
  );

  return fieldMeta;
};

const selectInitialValues = (state: FormikRefState<any>) => state.initialValues;

/**
 * Returns initial Formik values
 * @public
 */
export function useInitialValues<Values>() {
  return useFormikState<Values, [], FormikRefState<Values>['initialValues']>(
    selectInitialValues
  )[0];
}

const selectInitialTouched = (state: FormikRefState<unknown>) =>
  state.initialTouched;

/**
 * Returns initial Formik touched
 * @public
 */
export function useInitialTouched<Values>() {
  return useFormikState<Values, [], FormikRefState<Values>['initialTouched']>(
    selectInitialTouched
  )[0];
}

const selectInitialErrors = (state: FormikRefState<unknown>) =>
  state.initialErrors;

/**
 * Returns initial Formik errors
 * @public
 */
export function useInitialErrors<Values>() {
  return useFormikState<Values, [], FormikRefState<Values>['initialErrors']>(
    selectInitialErrors
  )[0];
}

const selectInitialStatus = (state: FormikRefState<any>) => state.initialStatus;

/**
 * Returns initial Formik status
 * @public
 */
export function useInitialStatus() {
  return useFormikState(selectInitialStatus)[0];
}

type SelectErrorsFn<Values> = (
  state: FormikRefState<Values>
) => FormikRefState<Values>['errors'];

const selectErrors: SelectErrorsFn<any> = state => state.errors;

/**
 * Returns Formik errors and updater function
 * @public
 */
export function useErrors<Values>(): [
  FormikErrors<Values>,
  SetErrorsFn<Values>
] {
  const [errors, { setErrors }] = useFormikState<
    Values,
    [],
    FormikRefState<Values>['errors']
  >(selectErrors);

  return [errors, setErrors];
}

const selectValues = (state: FormikRefState<any>) => state.values;

/**
 * Returns Formik values and updater function
 * @public
 */
export function useValues<Values>(): [Values, SetValuesFn<Values>] {
  const [values, { setValues }] = useFormikState<
    Values,
    [],
    FormikRefState<Values>['values']
  >(selectValues);

  return [values, setValues];
}

const selectTouched = (state: FormikRefState<unknown>) => state.touched;

/**
 * Returns Formik touched state and updater function
 * @public
 */
export function useTouched<Values>(): [
  FormikTouched<Values>,
  SetTouchedFn<Values>
] {
  const [touched, { setTouched }] = useFormikState<
    Values,
    [],
    FormikRefState<Values>['touched']
  >(selectTouched);

  return [touched, setTouched];
}

const selectStatus = (state: FormikRefState<unknown>) => state.status;

/**
 * Returns Formik status state and updater function
 * @public
 */
export function useStatus<Values>() {
  const [status, { setStatus }] = useFormikState<
    Values,
    [],
    FormikRefState<Values>['status']
  >(selectStatus);

  return [status, setStatus];
}

const selectIsSubmitting = (state: FormikRefState<unknown>) =>
  state.isSubmitting;

/**
 * Returns whether the form submission is currently being attempted
 * @public
 */
export function useIsSubmitting() {
  const [isSubmitting, { setSubmitting }] = useFormikState(selectIsSubmitting);

  return [isSubmitting, setSubmitting];
}

/**
 *
 * Returns whether the currently rendered form values are valid
 * @public
 */
export function useIsValid() {
  return useFormikComputedState().isValid;
}

/**
 * Returns whether the form is dirty
 * @public
 */
export function useIsDirty() {
  return useFormikComputedState().dirty;
}
