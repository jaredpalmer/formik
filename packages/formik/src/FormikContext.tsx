import * as React from 'react';
import { FormikContextType } from './types';
import invariant from 'tiny-warning';

export const FormikContext = React.createContext<FormikContextType<any, any>>(
  undefined as any
);
export const FormikProvider = FormikContext.Provider;
export const FormikConsumer = FormikContext.Consumer;

export function useFormikContext<Values, Status>() {
  const formik = React.useContext<FormikContextType<Values, Status>>(FormikContext);

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formik;
}
