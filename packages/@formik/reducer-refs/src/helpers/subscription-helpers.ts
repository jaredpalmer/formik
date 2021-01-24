import { isFunction } from '@formik/core';
import { Subscription } from '../hooks/useSubscriptions';

export type SliceFn<State, Return> = (state: State) => Return;

export type SelectorFn<State, Args extends any[], Return> = (
  ...args: Args
) => SliceFn<State, Return>;

export type Selector<State, Args extends any[], Return> = {
  selector: SelectorFn<State, Args, Return>;
  args: Args;
};

export type CreateSelectorFn<State> = <Args extends any[], Return>(
  selector: SelectorFn<State, Args, Return>,
  args: Args
) => Selector<State, Args, Return>;

export const selectCreateSelector = <State>(): CreateSelectorFn<State> => (
  selector,
  args
) => {
  return { selector, args };
};

export type GetSelectorFn<State> = <Args extends any[], Return>(
  selector: SliceFn<State, Return> | Selector<State, Args, Return>
) => SliceFn<State, Return>;

export const selectGetSelector = <State>(): GetSelectorFn<State> => <
  Args extends any[],
  Return
>(
  selector: SliceFn<State, Return> | Selector<State, Args, Return>
) => (isFunction(selector) ? selector : selector.selector(...selector.args));

export type Comparer<Return> = (prev: Return, next: Return) => boolean;

export type Subscriber<State, Args extends any[], Return> = {
  selector: Selector<State, Args, Return> | SliceFn<State, Return>;
  comparer: Comparer<Return>;
};

export type CreateSubscriberFn<State> = <Args extends any[], Return>(
  selector: Selector<State, Args, Return> | SliceFn<State, Return>,
  comparer: Comparer<Return>
) => Subscriber<State, Args, Return>;

export const selectCreateSubscriber = <State>(): CreateSubscriberFn<State> => (
  selector,
  comparer
) => {
  return { selector, comparer };
};

export type CreateSubscriptionFn<State, Args extends any[], Return> = (
  subscriber: Subscriber<State, Args, Return>
) => Subscription<State, Args, Return>;

/**
 * Create a new Subscription
 */
export const selectCreateSubscription = <State>(
  state: State,
  getSelector: GetSelectorFn<State>
) => <Return extends any, Args extends any[] = []>(
  subscriber: Subscriber<State, Args, Return>
): ReturnType<CreateSubscriptionFn<State, Args, Return>> => {
  const selector = getSelector(subscriber.selector);
  return {
    subscriber,
    selector,
    prevStateRef: {
      current: selector(state),
    },
    listeners: [],
  };
};

const selectorMatches = <State, Args extends any[], Return extends any>(
  selector: Selector<State, any, any>,
  newSelector: Selector<State, Args, Return>
) => {
  return (
    selector.selector === newSelector.selector &&
    selector.args.length === newSelector.args.length &&
    (newSelector.args.length === 0 ||
      newSelector.args.every((arg, index) => arg === selector.args[index]))
  );
};

const subscriptionMatches = <State, Args extends any[], Return>(
  subscription: Subscription<State, any, any>,
  newSubscriber: Subscriber<State, Args, Return>
) =>
  subscription.subscriber.comparer === newSubscriber.comparer &&
  isFunction(subscription.subscriber.selector) &&
  isFunction(newSubscriber.selector)
    ? subscription.subscriber.selector === newSubscriber.selector
    : !isFunction(subscription.subscriber.selector) &&
      !isFunction(newSubscriber.selector)
    ? selectorMatches(subscription.subscriber.selector, newSubscriber.selector)
    : false;

export const getSubscription = <State, Args extends any[], Return extends any>(
  subscriptions: Subscription<State, any, any>[],
  subscriber: Subscriber<State, Args, Return>
) => {
  return subscriptions.find(subscription =>
    subscriptionMatches(subscription, subscriber)
  );
};
/**
 * Walk through existing subscriptions and get or create them.
 */
export const getOrCreateSubscription = <
  State,
  Args extends any[],
  Return extends any
>(
  subscriptions: Subscription<State, any, any>[],
  newSubscriber: Subscriber<State, Args, Return>,
  createSubscription: CreateSubscriptionFn<State, Args, Return>
): Subscription<State, Args, Return> => {
  let subscription = getSubscription(subscriptions, newSubscriber);

  if (!subscription) {
    subscription = createSubscription(newSubscriber);
    subscriptions.push(subscription);
  }

  return subscription;
};
