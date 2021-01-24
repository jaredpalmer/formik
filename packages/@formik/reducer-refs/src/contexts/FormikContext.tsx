import * as React from 'react';
import { FormikContextType } from '@formik/core';
import { useFormikContext } from '../hooks/useFormikContext';

export const FormikContext = React.createContext<FormikContextType<any>>(
  undefined as any
);
export const FormikProvider = FormikContext.Provider;

/**
 * @deprecated Using a full Formik Context is deprecated. Please access bits of Formik state via useFormikState() or micro-hooks.
 */
export function FormikConsumer<Values = any>({
  children,
}: {
  children: (formik: FormikContextType<Values>) => React.ReactNode;
}) {
  const formik = useFormikContext<Values>();

  return <>{children(formik)}</>;
}
