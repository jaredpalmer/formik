import * as React from 'react';
import {
  createContext,
  useContext,
  useContextSelector,
} from 'use-context-selector';
import invariant from 'tiny-warning';
import { FormikContextType } from '@formik/core';

export const FormikContext = createContext<FormikContextType<any>>(
  undefined as any
);

export const FormikProvider = FormikContext.Provider;

export function useFormikContext<Values>() {
  return useContext<FormikContextType<Values>>(FormikContext);
}

export function FormikConsumer<Values = any>({
  children,
}: {
  children: (formik: FormikContextType<Values>) => React.ReactNode;
}) {
  const formik = useFormikContext<Values>();

  invariant(
    !!formik,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return <>{children(formik)}</>;
}

export function useFormikContextSelector<Values = any, Slice = any>(
  selector: (value: FormikContextType<Values>) => Slice
): Slice {
  return useContextSelector(FormikContext, selector);
}
