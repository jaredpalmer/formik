import { useFormikState } from '@formik/reducer-refs';
import React from 'react';
import { DisplayProps } from './DisplayProps';

export const FormikState = () => {
  const [formikState] = useFormikState();

  return <DisplayProps {...formikState} />;
};

export default FormikState;
