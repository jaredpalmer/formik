import * as React from 'react';
import { FormikContextType, FormikValues } from './types';
import invariant from 'tiny-warning';

export const FormikContext = React.createContext<FormikContextType<any>>(
  undefined as any
);
FormikContext.displayName = 'FormikContext';

export const FormikProvider = FormikContext.Provider;
export const FormikConsumer = FormikContext.Consumer;

export function useFormikContext<Values extends FormikValues>() {
  const formik = React.useContext<FormikContextType<Values>>(FormikContext as unknown as React.Context<FormikContextType<Values>>);

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formik;
}
