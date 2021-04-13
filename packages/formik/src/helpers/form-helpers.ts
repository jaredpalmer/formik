import { FormikErrors } from './../types';
import isEqual from 'react-fast-compare';
import { FormikReducerState } from "../types";

/**
 * Validity function where Formik combines its props with these bits of state
 *
 * @internal
 */
export type IsFormValidFn<Values> = (
  errors: FormikErrors<Values>,
  dirty: boolean
) => boolean;

/**
 * Calculate ComputedState from FormikState
 *
 * @internal
 */
export const populateComputedState = (
  isFormValid: IsFormValidFn<any>,
  state: FormikReducerState<any>
) => {
  // we do not want to run a deep equals on every render
  const dirty = !isEqual(state.initialValues, state.values);
  const isValid = isFormValid(state.errors, dirty);

  return {
    ...state,
    dirty,
    isValid,
  };
};

export const selectFullState = <T,>(state: T) => state;
