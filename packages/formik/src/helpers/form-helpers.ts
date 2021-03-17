import { FormikErrors } from './../types';
import isEqual from 'react-fast-compare';
import { FormikState } from "../types";

/**
 * Select State needed to calculate FormikComputedState
 *
 * @internal
 */
export const selectStateToCompute = (state: FormikState<any>) => ({
  errors: state.errors,
  values: state.values,
  initialValues: state.initialValues,
});

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
export const selectComputedState = (
  isFormValid: IsFormValidFn<any>,
  state: Pick<FormikState<any>, 'initialValues' | 'values' | 'errors'>
) => {
  // we do not want to run a deep equals on every render
  const dirty = !isEqual(state.initialValues, state.values);
  const isValid = isFormValid(state.errors, dirty);

  return {
    dirty,
    isValid,
  };
};
