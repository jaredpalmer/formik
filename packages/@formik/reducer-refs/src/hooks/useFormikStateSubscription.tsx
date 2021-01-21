import { FormikValues, useIsomorphicLayoutEffect } from '@formik/core';
import React from 'react';
import { Subscriber } from '../helpers/subscription-helpers';
import { FormikRefState } from '../types';
import { useFormikApi } from './useFormikApi';

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
  subscriber: Subscriber<FormikRefState<Values>, Args, Return>
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
