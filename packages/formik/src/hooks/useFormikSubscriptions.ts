import React, { Reducer } from 'react';
import { useSubscription } from 'use-subscription';
import { populateComputedState, IsFormValidFn } from '../helpers/form-helpers';
import {
  FormikMessage,
  FormikReducerState,
  FormikState,
} from '../types';
import {
  Selector,
  Comparer,
  useOptimizedSelector,
} from 'use-optimized-selector';
import { useEventCallback } from './useEventCallback';
import { BatchCallback, getBatch } from '../helpers/batch-helpers';

export const useFormikSubscriptions = <Values>(
  initialState: FormikReducerState<Values>,
  formikReducer: Reducer<FormikReducerState<Values>, FormikMessage<Values>>,
  isFormValid: IsFormValidFn<Values>
) => {
  /**
   * A list of callbacks for updating subscriptions.
   * These should only be updated during a batch when using React-Dom / React-Native renderers.
   */
  const subscriptionsRef = React.useRef<Function[]>([]);

  /**
   * StateRef contains only the Reducer State.
   * Not computed state like isDirty, isValid.
   */
  const stateRef = React.useRef<FormikReducerState<Values>>(initialState);

  /**
   * Get computed state from current reducer state.
   * Note: this creates a new computedState,
   * and should only be used to update computedStateRef.
   *
   * Use computedStateRef to access the value.
   */
  const getComputedState = useEventCallback(
    () => populateComputedState(isFormValid, stateRef.current),
  );

  // Don't call getComputedState on every render.
  const computedStateRef = React.useRef(React.useMemo(() => getComputedState(), []));

  /**
   * Get latest state. Does not recreate state,
   * but uses previously computed state created by dispatch.
   */
  const getState = React.useCallback(() => computedStateRef.current, [computedStateRef]);

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
    [subscriptionsRef, computedStateRef]
  );

  /**
   * Make sure to batch updates to subscriptions.
   */
  const batch = React.useCallback((callback: BatchCallback) => {
    getBatch()(callback);
  }, []);

  /**
   * Each call to dispatch _immediately_ updates the ref.
   * It also batches updates to all subscribers.
   */
  const dispatch = React.useCallback(
    (msg: FormikMessage<Values>) => {
      stateRef.current = formikReducer(stateRef.current, msg);
      // calculate computed state once on each dispatch,
      // so it can be reused across subscriptions
      computedStateRef.current = getComputedState();

      batch(() => {
        subscriptionsRef.current.forEach(callback => callback());
      })
    },
    [stateRef]
  );

  return {
      useState,
      getState: getComputedState,
      dispatch
  }
};
