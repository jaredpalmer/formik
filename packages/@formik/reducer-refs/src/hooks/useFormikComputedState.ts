import { FormikValues, FormikComputedState } from '@formik/core';
import { useMemo } from 'react';
import { useFormikApi } from './useFormikApi';
import { FormikRefApi, FormikRefState } from '../types';
import { useFormikStateSlice } from './useFormikStateSlice';

/**
 * `useFormikState`, but accepting `FormikApi` as a parameter.
 *
 * @param api FormikApi instance returned by `useFormik` or `useFormikApi`
 * @param shouldAddFormEffect whether to continue listening for FormikState changes
 */
export const useFormikComputedStateInternal = <Values extends FormikValues>(
  api: FormikRefApi<Values>,
  state: Pick<FormikRefState<Values>, 'errors' | 'dirty'>
): FormikComputedState => {
  const { isFormValid } = api;

  const isValid = useMemo(() => {
    return isFormValid(state.errors, state.dirty);
  }, [isFormValid, state.errors, state.dirty]);

  return {
    isValid,
    dirty: state.dirty,
  };
};

/**
 * Subscribe to Formik State and Computed State updates.
 */
export const useFormikComputedState = () => {
  return useFormikComputedStateInternal(
    useFormikApi(),
    useFormikStateSlice(state => ({
      errors: state.errors,
      dirty: state.dirty,
    }))
  );
};
