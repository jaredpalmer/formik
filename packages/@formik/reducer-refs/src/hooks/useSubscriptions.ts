import {
  useCheckableEventCallback,
  useIsomorphicLayoutEffect,
} from '@formik/core';
import { MutableRefObject, useMemo, useRef } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import {
  selectCreateSelector,
  selectGetSelector,
  getOrCreateSubscription,
  getSubscription,
  selectCreateSubscription,
  CreateSelectorFn,
  CreateSubscriberFn,
  GetSelectorFn,
  SliceFn,
  Subscriber,
  selectCreateSubscriber,
} from '../helpers/subscription-helpers';

export type SubscriptionApi<State> = {
  subscribe: SubscribeFn<State>;
  getSelector: GetSelectorFn<State>;
  createSelector: CreateSelectorFn<State>;
  createSubscriber: CreateSubscriberFn<State>;
};

export type SubscriptionCallback<Return> = (value: Return) => void;
export type SubscribeFn<State> = <Args extends any[], Return>(
  newSubscriber: Subscriber<State, Args, Return>,
  callback: SubscriptionCallback<Return>
) => UnsubscribeFn;
export type UnsubscribeFn = () => void;

export interface Subscription<State, Args extends any[], Return> {
  subscriber: Subscriber<State, Args, Return>;
  selector: SliceFn<State, Return>;
  listeners: SubscriptionCallback<Return>[];
  prevStateRef: MutableRefObject<Return>;
}

export const useSubscriptions = <State>(state: State) => {
  const subscriptionsRef = useRef<Subscription<State, any, any>[]>([]);

  const getSelector: GetSelectorFn<State> = useMemo(
    () => selectGetSelector(),
    []
  );

  // these selectors need some help inferring
  const createSelector: CreateSelectorFn<State> = useMemo(
    () => selectCreateSelector<State>(),
    []
  );

  const createSubscriber: CreateSubscriberFn<State> = useMemo(
    () => selectCreateSubscriber<State>(),
    []
  );

  const createSubscription = useCheckableEventCallback(
    // should this use getState() ??
    () => selectCreateSubscription(state, getSelector),
    [getSelector, state]
  );

  // TypeScript needs help inferring these generics.
  const subscribe: <Args extends any[], Return>(
    newSubscriber: Subscriber<State, Args, Return>,
    callback: SubscriptionCallback<Return>
  ) => UnsubscribeFn = useCheckableEventCallback(
    () => <Args extends any[], Return>(
      newSubscriber: Subscriber<State, Args, Return>,
      callback: SubscriptionCallback<Return>
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
