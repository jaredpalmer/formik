import React from 'react';
import { FormikState, FormikValues } from '../types';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type FormikSliceFn<Values, Result> = (
  formState: FormikState<Values>
) => Result;

/**
 * Important! Use a stable or memoized subscriber.
 */
export const useFormikStateSubscription = <
  Values extends FormikValues,
  Return
>(
  api: FormikApi<Values>,
  selector: FormikSliceFn<Values, Return>,
  shouldSubscribe = true
) => {
  const { subscribe, getState } = api;
  const [sliceState, setSliceState] = React.useState(() =>
    selector(getState())
  );

  useIsomorphicLayoutEffect(() => {
    if (shouldSubscribe) {
      return subscribe(selector, setSliceState);
    }

    return;
  }, [subscribe, selector, shouldSubscribe]);

  return sliceState;
};
