import { useMemo } from 'react';
import { FormikApi, FormikComputedState, FormikState } from '../types';
import { useFormikComputedState } from './useFormikComputedState';

export const selectFullState = <T>(value: T) => value;

export const useFullFormikState = <Values>(
  api: FormikApi<Values>,
  shouldSubscribe = true
): FormikState<Values> & FormikComputedState => {
  const state = api.useState(selectFullState, Object.is, shouldSubscribe);
  const computedState = useFormikComputedState(api);

  return useMemo(
    () => ({
      ...state,
      ...computedState,
    }),
    [state, computedState]
  );
};
