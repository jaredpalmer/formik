import * as React from 'react';
import { FormikContext } from './types';
import invariant from 'tiny-warning';

const PrivateFormikContext = React.createContext<FormikContext<any>>(
  undefined as any
);
export const FormikProvider = PrivateFormikContext.Provider;
export const FormikConsumer = PrivateFormikContext.Consumer;

export function useFormikContext<Values>() {
  const formik = React.useContext<FormikContext<Values>>(PrivateFormikContext);

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formik;
}
