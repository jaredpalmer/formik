import isEqual from 'react-fast-compare';
import { useMemo } from 'react';
import { FormikApi, FormikComputedState, FormikState } from './../types';
import { useFormikApi } from './useFormikApi';

export const selectComputedState = <Values>(
  { isFormValid }: FormikApi<Values>,
  state: Pick<FormikState<Values>, 'initialValues' | 'values' | 'errors'>
) => {
  // we do not want to run a deep equals on every render
  const dirty = useMemo(
    () => !isEqual(state.initialValues, state.values),
    [state.initialValues, state.values]
  );

  const isValid = isFormValid(state.errors, dirty);

  return {
    dirty,
    isValid
  };
}

const selectStateToCompute = (state: FormikState<any>) => ({
  errors: state.errors,
  values: state.values,
  initialValues: state.initialValues,
});

export const useFormikApiComputedState = <Values = any>(formikApi: FormikApi<Values>) => {
  const stateToCompute = formikApi.useState(selectStateToCompute);

  return selectComputedState(formikApi, stateToCompute);
}

export const useFormikComputedState = <Values>(): FormikComputedState => {
  return useFormikApiComputedState(useFormikApi<Values>());
};
