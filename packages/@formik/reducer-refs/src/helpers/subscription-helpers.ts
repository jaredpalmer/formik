import { FormikState, FormikValues, isFunction } from '@formik/core';
import { FormikSelector, FormikSliceFn } from '../hooks/createSelector';
import { FormikSubscriber } from '../hooks/createSubscriber';
import { FormikSubscription } from '../hooks/useSubscriptions';

export type GetSelectorFn<Values, State extends FormikState<Values>> = <
  Args extends any[],
  Return
>(
  selector:
    | FormikSliceFn<Values, Return, State>
    | FormikSelector<Values, Args, Return, State>
) => FormikSliceFn<Values, Return, State>;

export const selectGetSelector = <
  Values extends FormikValues,
  State extends FormikState<Values>
>(): GetSelectorFn<Values, State> => <Args extends any[], Return>(
  selector:
    | FormikSliceFn<Values, Return, State>
    | FormikSelector<Values, Args, Return, State>
) => (isFunction(selector) ? selector : selector.selector(...selector.args));

export type CreateSubscriptionFn<
  Values,
  Args extends any[],
  Return,
  State extends FormikState<Values> = FormikState<Values>
> = (
  subscriber: FormikSubscriber<Values, Args, Return, State>
) => FormikSubscription<Values, Args, Return, State>;

/**
 * Create a new Subscription
 */
export const selectCreateSubscription = <
  Values,
  State extends FormikState<Values>
>(
  state: State,
  getSelector: GetSelectorFn<Values, State>
) => <Return extends any, Args extends any[] = []>(
  subscriber: FormikSubscriber<Values, Args, Return, State>
): ReturnType<CreateSubscriptionFn<Values, Args, Return, State>> => {
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

const selectorMatches = <
  Values,
  Args extends any[],
  Return extends any,
  State extends FormikState<Values>
>(
  selector: FormikSelector<Values, any, any, State>,
  newSelector: FormikSelector<Values, Args, Return, State>
) => {
  return (
    selector.selector === newSelector.selector &&
    selector.args.length === newSelector.args.length &&
    (newSelector.args.length === 0 ||
      newSelector.args.every((arg, index) => arg === selector.args[index]))
  );
};

const subscriptionMatches = <
  Values,
  Args extends any[],
  Return extends any,
  State extends FormikState<Values>
>(
  subscription: FormikSubscription<Values, any, any, State>,
  newSubscriber: FormikSubscriber<Values, Args, Return, State>
) =>
  subscription.subscriber.comparer === newSubscriber.comparer &&
  isFunction(subscription.subscriber.selector) &&
  isFunction(newSubscriber.selector)
    ? subscription.subscriber.selector === newSubscriber.selector
    : !isFunction(subscription.subscriber.selector) &&
      !isFunction(newSubscriber.selector)
    ? selectorMatches(subscription.subscriber.selector, newSubscriber.selector)
    : false;

export const getSubscription = <
  Values,
  Args extends any[],
  Return extends any,
  State extends FormikState<Values>
>(
  subscriptions: FormikSubscription<Values, any, any, State>[],
  subscriber: FormikSubscriber<Values, Args, Return, State>
) => {
  return subscriptions.find(subscription =>
    subscriptionMatches(subscription, subscriber)
  );
};
/**
 * Walk through existing subscriptions and get or create them.
 */
export const getOrCreateSubscription = <
  Values,
  Args extends any[],
  Return extends any,
  State extends FormikState<Values>
>(
  subscriptions: FormikSubscription<Values, any, any, State>[],
  newSubscriber: FormikSubscriber<Values, Args, Return, State>,
  createSubscription: CreateSubscriptionFn<Values, Args, Return, State>
): FormikSubscription<Values, any, any, State> => {
  let subscription = getSubscription(subscriptions, newSubscriber);

  if (!subscription) {
    subscription = createSubscription(newSubscriber);
    subscriptions.push(subscription);
  }

  return subscription;
};
