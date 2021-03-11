import invariant from 'tiny-warning';
import React from 'react';
import { FormikValues, FormikApi } from '../types';
import { FormikContext } from '../FormikContext';

export function useFormikApi<Values extends FormikValues>(): FormikApi<Values> {
  const formikApi = React.useContext(FormikContext);

  invariant(
    !!formikApi,
    `Formik context is undefined, please verify you are calling useFormikApi() as child of a <Formik> component.`
  );

  return formikApi;
}
