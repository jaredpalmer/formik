import {
  FormikValues,
  FormikComputedState,
  useIsomorphicLayoutEffect,
} from '@formik/core';
import { useState, useMemo } from 'react';
import { useFormikApi } from './useFormikApi';
import { FormikRefApi, FormikRefState } from '../types';

/**
 * `useFormikState`, but accepting `FormikApi` as a parameter.
 *
 * @param api FormikApi instance returned by `useFormik` or `useFormikApi`
 * @param shouldAddFormEffect whether to continue listening for FormikState changes
 */
export const useFormikRefStateInternal = <Values extends FormikValues>(
  api: FormikRefApi<Values>,
  shouldAddFormEffect: boolean = true
): [FormikRefState<Values> & FormikComputedState, FormikRefApi<Values>] => {
  const [formikState, setFormikState] = useState(api.getState());

  const isValid = useMemo(() => {
    return api.isFormValid(formikState.errors, formikState.dirty);
  }, [formikState.errors, formikState.dirty]);

  useIsomorphicLayoutEffect(() => {
    // in case someone accidentally passes `undefined`
    if (shouldAddFormEffect !== false) {
      return api.addFormEffect(setFormikState);
    }

    return;
  }, [shouldAddFormEffect]);

  return [
    {
      ...formikState,
      isValid,
    },
    api,
  ];
};

/**
 * Subscribe to Formik State and Computed State updates.
 */
export const useFormikState = <Values extends FormikValues>() => {
  const api = useFormikApi<Values>();

  return useFormikRefStateInternal(api);
};
