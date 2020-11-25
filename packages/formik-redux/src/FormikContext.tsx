import * as React from 'react';
import { FormikContextType } from '@formik/core';
import invariant from 'tiny-warning';
import { createContext, useContextSelector } from 'use-context-selector';

export const FormikContext = createContext<FormikContextType<any>>(
  undefined as any
);
export const FormikProvider = FormikContext.Provider;

export function FormikConsumer<Values = any>({
  children,
}: {
  children: (formik: FormikContextType<Values>) => React.ReactNode;
}) {
  const formik = useContextSelector(
    FormikContext,
    React.useCallback(c => c, [])
  ) as FormikContextType<Values>;
  return <>{children(formik)}</>;
}

export function useFormikContext<Values>() {
  const formik = useContextSelector(
    FormikContext,
    React.useCallback(c => c, [])
  ) as FormikContextType<Values>;

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formik;
}
