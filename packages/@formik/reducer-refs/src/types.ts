import {
  FormikValues,
  GetStateFn,
  FormikCoreApi,
  FormikState,
  FieldMetaProps,
  ValidateFormFn,
  FormikValidationConfig,
} from '@formik/core';

export type FormEffect<Values extends FormikValues> = (state: FormikState<Values>) => void;
export type FieldEffect<Value> = (state: FieldMetaProps<Value>) => void;
export type UnsubscribeFn = () => void;

export type FormikApi<Values extends FormikValues> =
  FormikCoreApi<Values> &
  FormikValidationConfig &
  {
    getState: GetStateFn<Values>,
    addFormEffect: (effect: FormEffect<Values>) => UnsubscribeFn,
    validateForm: ValidateFormFn<Values>,
  };
