import {
  GetSelectorFn,
  selectGetSelector,
} from './../helpers/subscription-helpers';
import {
  FormikState,
  FormikValues,
  useCheckableEventCallback,
  useIsomorphicLayoutEffect,
} from '@formik/core';
import { MutableRefObject, useMemo, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import {
  getOrCreateSubscription,
  getSubscription,
  selectCreateSubscription,
} from '../helpers/subscription-helpers';
import {
  CreateSelectorFn,
  FormikSliceFn,
  selectCreateFormikSelector,
} from './createSelector';
import {
  CreateSubscriberFn,
  FormikSubscriber,
  selectCreateFormikSubscriber,
} from './createSubscriber';

export type FormikSubscriptionCallback<Return> = (value: Return) => void;
export type SubscribeFn<
  Values extends FormikValues,
  State extends FormikState<Values>
> = <Args extends any[], Return>(
  newSubscriber: FormikSubscriber<Values, Args, Return, State>,
  callback: FormikSubscriptionCallback<Return>
) => UnsubscribeFn;
export type UnsubscribeFn = () => void;

export interface FormikSubscription<
  Values,
  Args extends any[],
  Return,
  State extends FormikState<Values>
> {
  subscriber: FormikSubscriber<Values, Args, Return, State>;
  selector: FormikSliceFn<Values, Return, State>;
  listeners: FormikSubscriptionCallback<Return>[];
  prevStateRef: MutableRefObject<Return>;
}

export const useSubscriptions = <Values, State extends FormikState<Values>>(
  state: State
) => {
  const subscriptionsRef = useRef<
    FormikSubscription<Values, any, any, State>[]
  >([]);

  const getSelector: GetSelectorFn<Values, State> = useMemo(
    () => selectGetSelector(),
    []
  );

  // these selectors need some help inferring
  const createSelector: CreateSelectorFn<Values, State> = useMemo(
    () => selectCreateFormikSelector<Values, State>(),
    []
  );

  const createSubscriber: CreateSubscriberFn<Values, State> = useMemo(
    () => selectCreateFormikSubscriber<Values, State>(),
    []
  );

  const createSubscription = useCheckableEventCallback(
    // should this use getState() ??
    () => selectCreateSubscription(state, getSelector),
    [getSelector, state]
  );

  // TypeScript needs help inferring these generics.
  const subscribe: <Args extends any[], Return>(
    newSubscriber: FormikSubscriber<Values, Args, Return, State>,
    callback: FormikSubscriptionCallback<Return>
  ) => UnsubscribeFn = useCheckableEventCallback(
    () => <Args extends any[], Return>(
      newSubscriber: FormikSubscriber<Values, Args, Return, State>,
      callback: FormikSubscriptionCallback<Return>
    ): UnsubscribeFn => {
      const subscription = getOrCreateSubscription(
        subscriptionsRef.current,
        newSubscriber,
        createSubscription
      );

      subscription.listeners.push(callback);

      return () => {
        const subscription = getSubscription(
          subscriptionsRef.current,
          newSubscriber
        );

        if (subscription?.listeners) {
          subscription.listeners = subscription?.listeners.filter(
            listener => listener !== callback
          );

          // maybe remove subscription entirely
          if (subscription.listeners.length === 0) {
            subscriptionsRef.current = subscriptionsRef.current.filter(
              s => s !== subscription
            );
          }
        }
      };
    },
    [createSubscription]
  );

  useIsomorphicLayoutEffect(() => {
    unstable_batchedUpdates(() => {
      subscriptionsRef.current.forEach(subscription => {
        const prevState = subscription.prevStateRef.current;
        const newState = subscription.selector(state);

        if (!subscription.subscriber.comparer(prevState, newState)) {
          subscription.prevStateRef.current = newState;
          subscription.listeners.forEach(listener => listener(newState));
        }
      });
    });
  }, [state]);

  return {
    subscribe,
    createSelector,
    getSelector,
    createSubscriber,
  };
};
