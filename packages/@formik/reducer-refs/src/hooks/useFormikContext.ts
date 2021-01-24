import invariant from 'tiny-warning';
import { FormikContextType } from '@formik/core';
import { useFormikApi } from './useFormikApi';
import { useFullFormikState } from './useFullFormikState';

/**
 * @deprecated Formik is no longer exposing its state as Context. Please use `useFormikStateSlice(state => { errors: state.errors })` for a slice of state, or `useFormikState()` for the whole thing (at the expense of performance)
 */
export function useFormikContext<Values>(): FormikContextType<Values> {
  const formikApi = useFormikApi<Values>();

  invariant(
    !!formikApi,
    `Formik API context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  const formikState = useFullFormikState<Values>(formikApi);

  return {
    ...formikApi,
    ...formikState,
  };
}
