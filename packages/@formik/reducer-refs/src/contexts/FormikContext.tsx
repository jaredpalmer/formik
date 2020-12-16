import * as React from 'react';
import { FormikContextType } from '@formik/core';
import { useFormikContext } from '../hooks/useFormikContext';

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