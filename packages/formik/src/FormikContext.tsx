import * as React from 'react';
import { FormikApi, FormikContextType, FormikValues } from './types';
import invariant from 'tiny-warning';
import { FormikConnectedType } from './connect';
import { useFullFormikState } from './hooks/useFullFormikState';

export const FormikContext = React.createContext<FormikContextType<any>>(
  undefined as any
);
FormikContext.displayName = 'FormikContext';

export const FormikProvider = FormikContext.Provider;

export function useFormikContext<Values extends FormikValues>(): FormikApi<
  Values
> {
  const formikApi = React.useContext(FormikContext);

  invariant(
    !!formikApi,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formikApi;
}

/**
 * @deprecated Please access state directly via the Formik API.
 */
export function FormikConsumer<Values = any>({
  children,
}: {
  children: (formik: FormikConnectedType<Values>) => React.ReactNode;
}) {
  const formik = useFormikContext<Values>();
  const state = useFullFormikState(formik);

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return (
    <>
      {children({
        ...formik,
        ...state,
      })}
    </>
  );
}
