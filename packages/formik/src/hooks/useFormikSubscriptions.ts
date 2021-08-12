import { IsFormValidFn } from './../helpers/form-helpers';
import React, { Reducer } from 'react';
import { useSubscription } from 'use-subscription';
import { populateComputedState } from '../helpers/form-helpers';
import {
  FormikReducerState,
  FormikState,
} from '../types';
import {
  Selector,
  Comparer,
  useOptimizedSelector,
} from 'use-optimized-selector';
import { useEventCallback } from './useEventCallback';
import { FormikMessage } from '../Formik';
import { BatchCallback, getBatch } from '../helpers/batch-helpers';

export const useFormikSubscriptions = <Values>(
  initialState: FormikReducerState<Values>,
  formikReducer: Reducer<FormikReducerState<Values>, FormikMessage<Values>>,
  isFormValid: IsFormValidFn<Values>
) => {
  const stateRef = React.useRef<FormikReducerState<Values>>(initialState);
  const isInBatchRef = React.useRef(false);
  const subscriptionsRef = React.useRef<Function[]>([]);

  const getState = useEventCallback(
    () => populateComputedState(isFormValid, stateRef.current),
  );

  /**
   * Update Subscriptions using RenderState.
   */
  const useState = React.useCallback(
    <Return>(
      selector: Selector<FormikState<Values>, Return>,
      comparer: Comparer<Return> = Object.is,
      shouldSubscribe: boolean = true
    ) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      selector = useOptimizedSelector(selector, comparer);

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const subscription = React.useMemo(
        () => ({
          getCurrentValue: () => selector(getState()),
          subscribe: shouldSubscribe
            ? (callback: Function) => {
                subscriptionsRef.current.push(callback);

                return () =>
                  subscriptionsRef.current.filter(
                    (cb: Function) => cb !== callback
                  );
              }
            : () => () => {},
        }),
        [selector, shouldSubscribe]
      );

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSubscription(subscription);
    },
    [subscriptionsRef]
  );

  /**
   * Make sure to batch updates to subscriptions.
   */
  const batch = React.useCallback((callback: BatchCallback) => {
    if (isInBatchRef.current) {
      callback()
    } else {
      isInBatchRef.current = true;
      getBatch()(callback);
      isInBatchRef.current = false;
    }
  }, []);

  /**
   * Each call to dispatch _immediately_ updates the ref.
   * It also batches updates to all subscribers.
   */
  const dispatch = React.useCallback(
    (msg: FormikMessage<Values>) => {
      stateRef.current = formikReducer(stateRef.current, msg)

      batch(() => {
        subscriptionsRef.current.forEach(callback => callback());
      })
    },
    [stateRef]
  );

  return {
      useState,
      getState,
      dispatch
  }
};
