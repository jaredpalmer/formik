import { useFormikComputedStateInternal } from './useFormikComputedState';
import { useMemo } from 'react';
import { FormikApi } from './useFormikApi';
import { FormikState } from '../types';
import { useFormikApiState } from './useFormikState';

export type FullFormikState<Values> = FormikState<Values> & FormikComputedState;

export type SelectFullStateFn<Values> = (
  state: FormikState<Values>
) => FormikState<Values>;

export const selectFullState: SelectFullStateFn<unknown> = state => state;

export const useFullFormikState = <Values>(
  api: FormikApi<Values>,
  shouldSubscribe = true
) => {
  const state = useFormikApiState(
    api,
    selectFullState,
    Object.is,
    shouldSubscribe
  );
  const computedState = useFormikComputedStateInternal(api, state);

  return useMemo(
    () => ({
      ...state,
      ...computedState,
    }),
    [state, computedState]
  );
};
