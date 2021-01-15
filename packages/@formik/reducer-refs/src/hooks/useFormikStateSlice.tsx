import { isEqual } from 'lodash';
import { FormikValues, useIsomorphicLayoutEffect } from '@formik/core';
import React from 'react';
import { FormEffect, FormikRefState } from '../types';
import { useFormikApi } from './useFormikApi';

export type FormSliceFn<Values, Result> = (
  formState: FormikRefState<Values>
) => Result;

/**
 * Important! Use a stable or memoized function for optimum performance.
 */
export const useFormikStateSlice = <Values extends FormikValues, Result>(
  sliceFn: FormSliceFn<Values, Result>
) => {
  const { addFormEffect, getState } = useFormikApi<Values>();
  const memoizedInitialValue = React.useMemo(() => sliceFn(getState()), [
    sliceFn,
    getState,
  ]);

  const sliceRef = React.useRef(memoizedInitialValue);
  const [sliceState, setSliceState] = React.useState(sliceRef.current);

  const maybeUpdateSlice = React.useCallback<FormEffect<any>>(
    formikState => {
      const newSlice = sliceFn(formikState);

      if (!isEqual(newSlice, sliceRef.current)) {
        sliceRef.current = newSlice;
        setSliceState(newSlice);
      }
    },
    [sliceFn]
  );

  useIsomorphicLayoutEffect(() => {
    return addFormEffect(maybeUpdateSlice);
  }, [maybeUpdateSlice, addFormEffect]);

  return sliceState;
};
