import { FormikValues, useIsomorphicLayoutEffect } from '@formik/core';
import React from 'react';
import { Subscriber } from '../helpers/subscription-helpers';
import { FormikRefState } from '../types';
import { FormikRefApi } from './useFormikApi';

export type FormSliceFn<Values, Result> = (
  formState: FormikRefState<Values>
) => Result;

/**
 * Important! Use a stable or memoized subscriber.
 */
export const useFormikStateSubscriptionInternal = <
  Values extends FormikValues,
  Args extends any[],
  Return
>(
  api: FormikRefApi<Values>,
  subscriber: Subscriber<FormikRefState<Values>, Args, Return>,
  shouldSubscribe = true
) => {
  const { subscribe, getState, getSelector } = api;
  const [sliceState, setSliceState] = React.useState(() =>
    getSelector(subscriber.selector)(getState())
  );

  useIsomorphicLayoutEffect(() => {
    if (shouldSubscribe) {
      return subscribe(subscriber, setSliceState);
    }

    return;
  }, [subscribe, subscriber, shouldSubscribe]);

  return sliceState;
};
