import { useFormikComputedStateInternal } from './useFormikComputedState';
import {
  FormikValues,
  FormikComputedState,
  useIsomorphicLayoutEffect,
} from '@formik/core';
import { useMemo, useState } from 'react';
import { FormikRefApi, useFormikApi } from './useFormikApi';
import { FormikRefState } from '../types';

export const selectFullState = <State>(state: State) => state;

/**
 * `useFormikState`, but accepting `FormikApi` as a parameter.
 *
 * @param api FormikApi instance returned by `useFormik` or `useFormikApi`
 * @param shouldAddFormEffect whether to continue listening for FormikState changes
 */
export const useFormikRefStateInternal = <Values extends FormikValues>(
  api: FormikRefApi<Values>,
  shouldAddFormEffect = true
): [FormikRefState<Values> & FormikComputedState, FormikRefApi<Values>] => {
  const { getState, createSubscriber } = api;
  const [formikState, setFormikState] = useState(getState());
  const computedState = useFormikComputedStateInternal(api, formikState);
  const subscriber = useMemo(
    () =>
      createSubscriber<[], FormikRefState<Values>>(selectFullState, Object.is),
    [createSubscriber]
  );

  useIsomorphicLayoutEffect(() => {
    // in case someone accidentally passes `undefined`
    if (shouldAddFormEffect !== false) {
      // not deep equals, because those are expensive checks.
      // instead, subscribing to full useFormikState should be discouraged
      return api.subscribe(subscriber, setFormikState);
    }

    return;
  }, [shouldAddFormEffect]);

  return [
    useMemo(
      () => ({
        ...formikState,
        ...computedState,
      }),
      [formikState, computedState]
    ),
    api,
  ];
};

/**
 * Subscribe to Formik State and Computed State updates.
 */
export const useFormikState = <Values extends FormikValues>() => {
  return useFormikRefStateInternal(useFormikApi<Values>());
};
