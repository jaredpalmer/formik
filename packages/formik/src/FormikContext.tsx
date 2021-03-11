import * as React from 'react';
import { FormikContextType } from './types';
import invariant from 'tiny-warning';
import { useFormikApi } from './hooks/useFormikApi';
import { useFullFormikState } from './hooks/useFullFormikState';

export const FormikContext = React.createContext<FormikContextType<any>>(
  undefined as any
);
FormikContext.displayName = 'FormikContext';

export const FormikProvider = FormikContext.Provider;
export const FormikConsumer = FormikContext.Consumer;

/**
 * @deprecated Please use useFormikApi() and access state from api.useState().
 */
export function useFormikContext<Values>() {
  const formik = useFormikApi<Values>();

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  const state = useFullFormikState(formik);

  return {
    ...formik,
    ...state,
  };
}
