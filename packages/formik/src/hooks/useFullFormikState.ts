import { useMemo } from 'react';
import { FormikApi, FormikComputedState, FormikState } from '../types';

/**
 * @internal
 *
 * This is a specialized hook that will return Formik's full, unoptimized state.
 * It is internally used for components with render functions / child functions.
 * It also calculates computed state.
 */
export const useFullFormikState = <Values>(
  api: FormikApi<Values>,
  shouldSubscribe = true
): FormikState<Values> & FormikComputedState => {
  const state = api.useState(
    useMemo(() => value => value, []),
    Object.is,
    shouldSubscribe
  );

  // computed state
  const computedState = api.useComputedState(shouldSubscribe);

  return useMemo(
    () => ({
      ...state,
      ...computedState
    }),
    [state, computedState]
  );
};
