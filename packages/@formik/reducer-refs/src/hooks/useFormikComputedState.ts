import { FormikComputedState } from '@formik/core';
import { useMemo } from 'react';
import { FormikRefApi } from './useFormikApi';
import { FormikRefState } from '../types';
import { isEqual } from 'lodash';
import { useFormikState } from './useFormikState';

/**
 * `useFormikState`, but accepting `FormikApi` as a parameter.
 *
 * @param api FormikApi instance returned by `useFormik` or `useFormikApi`
 * @param shouldAddFormEffect whether to continue listening for FormikState changes
 */
export const useFormikComputedStateInternal = (
  api: FormikRefApi<any>,
  state: Pick<FormikRefState<any>, 'errors' | 'dirty'>
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

const selectComputedState = (state: FormikRefState<any>) => ({
  errors: state.errors,
  dirty: state.dirty,
});

/**
 * Subscribe to Formik State and Computed State updates.
 */
export const useFormikComputedState = () => {
  const [computedState, api] = useFormikState(selectComputedState, isEqual);

  return useFormikComputedStateInternal(api, computedState);
};
