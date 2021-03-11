import { useMemo } from 'react';
import { FormikApi, FormikComputedState, FormikState } from '../types';
import { selectComputedState } from './useFormikComputedState';

export const selectFullState = <T>(value: T) => value;

export const useFullFormikState = <Values>(
  api: FormikApi<Values>,
  shouldSubscribe = true
): FormikState<Values> & FormikComputedState => {
  const state = api.useState(selectFullState, Object.is, shouldSubscribe);
  const computedState = selectComputedState(api, state);

  return useMemo(
    () => ({
      ...state,
      ...computedState,
    }),
    [state, computedState]
  );
};
