import { useMemo } from 'react';
import { FormikApi, FormikComputedState } from './../types';

export const useFormikComputedState = <Values>({
  dirty,
  isValid,
}: FormikApi<Values>): FormikComputedState => {
  return useMemo(
    () => ({
      dirty,
      isValid,
    }),
    [dirty, isValid]
  );
};
