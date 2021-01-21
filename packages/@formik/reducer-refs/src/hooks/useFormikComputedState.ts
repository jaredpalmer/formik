import { FormikValues, FormikComputedState } from '@formik/core';
import { useMemo } from 'react';
import { FormikRefApi, useFormikApi } from './useFormikApi';
import { FormikRefState } from '../types';
import { useFormikStateSubscription } from './useFormikStateSubscription';
import { isEqual } from 'lodash';

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

const selectComputedState = <Values extends FormikValues>(
  state: FormikRefState<Values>
) => ({
  errors: state.errors,
  dirty: state.dirty,
});

/**
 * Subscribe to Formik State and Computed State updates.
 */
export const useFormikComputedState = () => {
  const api = useFormikApi();
  const subscriber = useMemo(
    () => api.createSubscriber(selectComputedState, isEqual),
    [api]
  );
  return useFormikComputedStateInternal(
    api,
    useFormikStateSubscription(subscriber)
  );
};
