import * as React from 'react';
import { FormikContextType } from './types';
import invariant from 'tiny-warning';

export const FormikContext = React.createContext<FormikContextType<any>>(
  undefined as any
);
export const FormikProvider = FormikContext.Provider;
export const FormikConsumer = FormikContext.Consumer;

export function useFormikContext<Values>() {
  const formik = React.useContext<FormikContextType<Values>>(FormikContext);

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formik;
}
