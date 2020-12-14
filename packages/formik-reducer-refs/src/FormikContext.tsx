import * as React from 'react';
import { FormikContextType } from '@formik/core';
import invariant from 'tiny-warning';
import { useFormikApi } from './FormikApiContext';

export const FormikContext = React.createContext<FormikContextType<any>>(
  undefined as any
);
export const FormikProvider = FormikContext.Provider;

export function FormikConsumer<Values = any>({
  children,
}: {
  children: (formik: FormikContextType<Values>) => React.ReactNode;
}) {
  const formik = useFormikContext<Values>();

  return <>{children(formik)}</>;
}

export function useFormikContext<Values>(): FormikContextType<Values> {
  const formikApi = useFormikApi<Values>();
  const [formikState, setFormikState] = React.useState(formikApi.getState());
  
  React.useEffect(() => {
    return formikApi.addFormEffect(setFormikState);
  }, []);

  invariant(
    !!formikApi,
    `Formik API context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return {
    ...formikApi,
    ...formikState,
  };
}
