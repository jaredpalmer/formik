import invariant from 'tiny-warning';
import React from 'react';
import { FormikApiContext } from '../contexts/FormikApiContext';
import { FormikRefState, GetRefStateFn } from '../types';
import {
  FormikCoreApi,
  FormikValidationConfig,
  FormikValues,
  ValidationHandler,
} from '@formik/core';
import { SubscriptionApi } from './useSubscriptions';

export type FormikRefApi<Values extends FormikValues> = FormikCoreApi<Values> &
  FormikValidationConfig &
  SubscriptionApi<FormikRefState<Values>> & {
    getState: GetRefStateFn<Values>;
    validateForm: ValidationHandler<Values>;
  };

export function useFormikApi<Values extends FormikValues>() {
  const formikApi = React.useContext(FormikApiContext);

  invariant(
    !!formikApi,
    `Formik context is undefined, please verify you are calling useFormikContext() as child of a <Formik> component.`
  );

  return (formikApi as unknown) as FormikRefApi<Values>;
}
