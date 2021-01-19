import {
  FormikSubscriptionArgs,
  FormikSubscriptionState,
} from './../hooks/useFormik';
import { FormikState, GetStateFn, isFunction } from '@formik/core';
import { FormikSubscriptionMap, FormikSubscriptionSet } from '..';
import { FormikSelector } from '../hooks/createSelector';
import { FormikSubscriber } from '../hooks/createSubscriber';

export type InitSubscriptionFn<
  Values,
  Args extends any[],
  Return,
  State extends FormikState<Values> = FormikState<Values>
> = (
  selector: FormikSelector<Values, Args, Return, State>
) => FormikSubscriptionState<Values, Return, State> &
  FormikSubscriptionArgs<Values, Return, State>;

/**
 * Create a new Subscription
 */
export const selectInitSubscription = <
  Values,
  State extends FormikState<Values>
>(
  getState: GetStateFn<Values, State>
) => <Return extends any, Args extends any[] = []>(
  selector: FormikSelector<Values, Args, Return, State>
): ReturnType<InitSubscriptionFn<Values, Args, Return, State>> => {
  const selectorFn = isFunction(selector)
    ? selector
    : selector.selector(...selector.args);
  return {
    selector: selectorFn,
    prevStateRef: {
      current: selectorFn(getState()),
    },
    listeners: [],
    args: new Map(),
  };
};

const isFullSubscription = <Values, Return, State>(
  value: Partial<FormikSubscriptionSet<Values, Return, State>>
): value is Required<FormikSubscriptionSet<Values, Return, State>> => {
  return !!value.selector;
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
  subscribers: FormikSubscriptionMap<Values, State>,
  newSubscriber: FormikSubscriber<Values, Args, Return, State>,
  initSubscription: InitSubscriptionFn<Values, Args, Return, State>
): Required<FormikSubscriptionSet<Values, Return, State>> | undefined => {
  let selectors = subscribers.get(newSubscriber.comparer);

  if (!selectors) {
    selectors = new Map();
    subscribers.set(newSubscriber.comparer, selectors);
  }

  let finalSelector:
    | Required<FormikSubscriptionSet<Values, Return, State>>
    | undefined;

  if (isFunction(newSubscriber.selector)) {
    const currentSelector: Partial<
      FormikSubscriptionSet<Values, Return, State>
    > = selectors.get(newSubscriber.selector) ?? {};

    if (!currentSelector.selector) {
      finalSelector = {
        ...currentSelector,
        ...initSubscription(newSubscriber.selector),
      };

      selectors.set(newSubscriber.selector, finalSelector);
    }
  } else {
    let currentSelector: Partial<FormikSubscriptionSet<Values, Return, State>> =
      selectors.get(newSubscriber.selector.selector) ?? {};
    const args = newSubscriber.selector.args;

    if (args.length === 0) {
      // if we're targeting this subscription, initialize it,
      // else we'll keep walking args
      if (!isFullSubscription(currentSelector)) {
        finalSelector = {
          ...currentSelector,
          ...initSubscription(newSubscriber.selector),
        };

        selectors.set(newSubscriber.selector.selector, finalSelector);
      } else {
        finalSelector = currentSelector;
      }
    } else if (!currentSelector) {
      const newSelector = {
        args: new Map(),
      };
      currentSelector = newSelector;
      selectors.set(newSubscriber.selector.selector, newSelector);
    }

    for (let argIndex = 0; argIndex < args.length; argIndex++) {
      const arg = args[argIndex];
      let nextSelector: Partial<FormikSubscriptionSet<Values, Return, State>> =
        currentSelector?.args?.get(arg) ?? {};

      if (argIndex === args.length - 1) {
        // if we're targeting this subscription, initialize it,
        // else we'll keep walking args
        if (!isFullSubscription(nextSelector)) {
          finalSelector = {
            ...nextSelector,
            ...initSubscription(newSubscriber.selector),
          };

          currentSelector.args?.set(arg, finalSelector);
        } else {
          finalSelector = nextSelector;
        }
      } else if (!nextSelector) {
        const newSelector = {
          args: new Map(),
        };
        nextSelector = newSelector;

        currentSelector.args?.set(arg, newSelector);
      }

      currentSelector = nextSelector;
    }
  }

  return finalSelector;
};

export const getSubscription = <
  Values,
  Args extends any[],
  Return extends any,
  State extends FormikState<Values>
>(
  subscribers: FormikSubscriptionMap<Values, State>,
  subscriber: FormikSubscriber<Values, Args, Return, State>
) => {
  const selectors = subscribers.get(subscriber.comparer);

  let subscription:
    | Required<FormikSubscriptionSet<Values, Return, State>>
    | undefined;

  if (selectors) {
    if (isFunction(subscriber.selector)) {
      const maybeSubscription = selectors.get(subscriber.selector);

      if (maybeSubscription && isFullSubscription(maybeSubscription)) {
        subscription = maybeSubscription;
      }
    } else {
      let maybeSubscription = selectors.get(subscriber.selector.selector);
      const args = subscriber.selector.args;

      if (args.length === 0) {
        subscription =
          maybeSubscription && isFullSubscription(maybeSubscription)
            ? maybeSubscription
            : undefined;
      } else if (maybeSubscription) {
        for (let argIndex = 0; argIndex < args.length; argIndex++) {
          const arg = args[argIndex];
          const nextSelector:
            | FormikSubscriptionSet<Values, Return, State>
            | undefined = maybeSubscription?.args?.get(arg);

          if (!nextSelector) {
            break;
          }

          if (argIndex === args.length - 1) {
            subscription = isFullSubscription(nextSelector)
              ? nextSelector
              : undefined;
          } else {
            maybeSubscription = nextSelector;
          }
        }
      }
    }
  }

  return subscription;
};
