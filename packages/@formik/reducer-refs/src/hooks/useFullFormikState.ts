import { useFormikComputedStateInternal } from './useFormikComputedState';
import { useMemo } from 'react';
import { FormikRefApi } from './useFormikApi';
import { FormikRefState } from '../types';
import { useFormikStateInternal } from './useFormikState';

export type SelectFullStateFn<Values> = (
  state: FormikRefState<Values>
) => FormikRefState<Values>;

export const selectFullState: SelectFullStateFn<unknown> = state => state;

export const useFullFormikState = <Values>(
  api: FormikRefApi<Values>,
  shouldSubscribe = true
) => {
  const state = useFormikStateInternal(
    api,
    selectFullState as SelectFullStateFn<Values>,
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
