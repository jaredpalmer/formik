import { useFormikStateSubscriptionInternal } from './useFormikStateSubscription';
import {
  Comparer,
  SelectorFn,
  SliceFn,
  Subscriber,
} from './../helpers/subscription-helpers';
import { isFunction } from '@formik/core';
import { useMemo } from 'react';
import { FormikRefApi, useFormikApi } from './useFormikApi';
import { FormikRefState } from '../types';

export type UseFormikStateFn<Values> = <Args extends any[], Return>(
  selector:
    | [SelectorFn<FormikRefState<Values>, Args, Return>, ...Args]
    | SliceFn<FormikRefState<Values>, Return>,
  comparer?: Comparer<Return>,
  shouldSubscribe?: boolean
) => Return;

/**
 * `useFormikState`, but accepting `FormikApi` as a parameter.
 *
 * @param api FormikApi instance returned by `useFormik` or `useFormikApi`
 */
export const useFormikStateInternal = <Values, Args extends any[], Return>(
  api: FormikRefApi<Values>,
  selector:
    | [SelectorFn<FormikRefState<Values>, Args, Return>, ...Args]
    | SliceFn<FormikRefState<Values>, Return>,
  comparer: Comparer<Return> = Object.is,
  shouldSubscribe = true
) => {
  const { createSelector, createSubscriber } = api;

  const subscriber: Subscriber<
    FormikRefState<Values>,
    Args,
    Return
  > = useMemo(() => {
    if (isFunction(selector)) {
      return createSubscriber(selector, comparer);
    } else {
      const [selectorFn, ...args] = selector;
      return createSubscriber(createSelector(selectorFn, args), comparer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    comparer,
    createSelector,
    createSubscriber,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...(isFunction(selector) ? [selector] : selector),
  ]);

  return useFormikStateSubscriptionInternal<Values, Args, Return>(
    api,
    subscriber,
    shouldSubscribe
  );
};

/**
 * Subscribe to Formik State and Computed State updates.
 */
export const useFormikState = <Values, Args extends any[], Return>(
  selector:
    | [SelectorFn<FormikRefState<Values>, Args, Return>, ...Args]
    | SliceFn<FormikRefState<Values>, Return>,
  comparer: Comparer<Return> = Object.is,
  shouldSubscribe = true
): [Return, FormikRefApi<Values>] => {
  const api = useFormikApi<Values>();
  return [
    useFormikStateInternal(api, selector, comparer, shouldSubscribe),
    api,
  ];
};
