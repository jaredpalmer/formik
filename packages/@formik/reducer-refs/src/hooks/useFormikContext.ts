import invariant from 'tiny-warning';
import { FormikContextType } from '@formik/core';
import { useFormikApi } from './useFormikApi';
import { useFormikRefStateInternal } from './useFormikState';

export function useFormikContext<Values>(): FormikContextType<Values> {
  const formikApi = useFormikApi<Values>();

  invariant(
    !!formikApi,
    `Formik API context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  const [formikState] = useFormikRefStateInternal(formikApi);

  return {
    ...formikApi,
    ...formikState,
  };
}
