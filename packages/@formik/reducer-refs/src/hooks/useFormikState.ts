import { FormikState, FormikValues } from '@formik/core';
import { useEffect, useState } from 'react';
import { useFormikApi } from './useFormikApi';
import { FormikApi } from '../types';

export const useFormikStateInternal = <Values extends FormikValues>(
    api: FormikApi<Values>
): [FormikState<Values>, FormikApi<Values>] => {
  const [formikState, setFormikState] = useState(api.getState());

  useEffect(() => {
    return api.addFormEffect(setFormikState);
  }, []);

  return [formikState, api];
}

export const useFormikState = <Values extends FormikValues>() => {
    const api = useFormikApi<Values>();

    return useFormikStateInternal(api);
}
