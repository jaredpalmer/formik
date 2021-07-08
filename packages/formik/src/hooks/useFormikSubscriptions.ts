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
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { useEventCallback } from './useEventCallback';
import { FormikMessage } from '../Formik';

export const useFormikSubscriptions = <Values>(
  initialState: FormikReducerState<Values>,
  formikReducer: Reducer<FormikReducerState<Values>, FormikMessage<Values>>,
  isFormValid: IsFormValidFn<Values>
) => {
  const stateRef = React.useRef<FormikReducerState<Values>>(initialState);

  /**
   * `stateInRender` should only be used to build the `formik.useState` hook.
   * We optimize it heavily because it will be called by every
   * subscription on every state update.
   *
   * Imperative methods will calculate computed state on the fly
   * based on latest ref (getState).
   */
  const [stateInRender, setState] = React.useState(stateRef.current);

  const computedStateInRender = React.useMemo(
    () => populateComputedState(isFormValid, stateInRender),
    [isFormValid, stateInRender]
  );

  const getStateInRender = useEventCallback(() => computedStateInRender);
  const subscriptionsRef = React.useRef<Function[]>([]);

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
          getCurrentValue: () => selector(getStateInRender()),
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
    [getStateInRender]
  );

  useIsomorphicLayoutEffect(() => {
    subscriptionsRef.current.forEach(callback => callback());
  }, [stateInRender]);

  const getState = useEventCallback(
    () => populateComputedState(isFormValid, stateRef.current),
  );

  /**
   * Each call to dispatch _immediately_ updates the ref.
   * It also dispatches to React's internal dispatcher.
   */
  const dispatch = React.useCallback(
    (msg: FormikMessage<Values>) => {
      /**
       * manually update state via reducer, and
       * dispatch resolved value via setState
       */
      setState((stateRef.current = formikReducer(stateRef.current, msg)));
    },
    [stateRef]
  );

  return {
      useState,
      getState,
      dispatch,
  }
};
