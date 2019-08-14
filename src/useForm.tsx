import React from 'react';
import { useFormik } from './Formik';
import { FormikFormProps } from './Form';
import { FormikValues, FormikConfig, FormikContext } from './types';
import { FormikProvider } from './FormikContext';

export function useForm<Values extends FormikValues = FormikValues>(
  config: FormikConfig<Values>
) {
  const formikProps = useFormik<Values>(config);

  const Form = (p: FormikFormProps) => (
    <FormikProvider value={formikProps}>
      <form
        onSubmit={formikProps.handleSubmit}
        onReset={formikProps.handleReset}
        {...p}
      />
    </FormikProvider>
  );

  const ret: [typeof Form, FormikContext<Values>] = [Form, formikProps];

  return ret;
}
