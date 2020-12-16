import invariant from 'tiny-warning';
import React from 'react';
import { FormikApiContext } from '../contexts/FormikApiContext';
import { FormikApi } from '../types';

export function useFormikApi<Values>() {
  const formikApi = React.useContext(
    FormikApiContext
  );

  invariant(
    !!formikApi,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return formikApi as unknown as FormikApi<Values>;
}
