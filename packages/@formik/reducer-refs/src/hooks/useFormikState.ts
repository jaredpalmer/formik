import { FormikState, FormikValues, FormikComputedProps } from '@formik/core';
import { useEffect, useState, useMemo } from 'react';
import { useFormikApi } from './useFormikApi';
import { FormikApi } from '../types';

export const useFormikStateInternal = <Values extends FormikValues>(
    api: FormikApi<Values>
): [FormikState<Values> & FormikComputedProps, FormikApi<Values>] => {
  const [formikState, setFormikState] = useState(api.getState());

  const isValid = useMemo(() => {
    return api.isFormValid(formikState.errors, formikState.dirty);
  }, [formikState.errors, formikState.dirty]);

  useEffect(() => {
    return api.addFormEffect(setFormikState);
  }, []);

  return [{
    ...formikState,
    isValid
  }, api];
}

export const useFormikState = <Values extends FormikValues>() => {
    const api = useFormikApi<Values>();

    return useFormikStateInternal(api);
}
