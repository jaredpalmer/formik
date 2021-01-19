import { FormikValues, useIsomorphicLayoutEffect } from '@formik/core';
import React from 'react';
import { FormikRefState } from '../types';
import { useFormikApi } from './useFormikApi';
import { FormikSubscriber } from './createSubscriber';

export type FormSliceFn<Values, Result> = (
  formState: FormikRefState<Values>
) => Result;

/**
 * Important! Use a stable or memoized subscriber.
 */
export const useFormikStateSubscription = <
  Values extends FormikValues,
  Args extends any[],
  Return
>(
  subscriber: FormikSubscriber<Values, Args, Return, FormikRefState<Values>>
) => {
  const { subscribe, getState, getSelector } = useFormikApi<Values>();
  const [sliceState, setSliceState] = React.useState(() =>
    getSelector(subscriber.selector)(getState())
  );

  useIsomorphicLayoutEffect(() => {
    return subscribe(subscriber, setSliceState);
  }, [subscribe, subscriber]);

  return sliceState;
};
