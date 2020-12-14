import * as React from 'react';
import invariant from 'tiny-warning';
import { FormikApiContextType } from './types';

export const FormikApiContext = React.createContext<FormikApiContextType<any> | undefined>(
  undefined
);

export function useFormikApi<Values>() {
  const formikApi = React.useContext(
    FormikApiContext
  );

  invariant(
    !!formikApi,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formikApi as unknown as FormikApiContextType<Values>;
}
