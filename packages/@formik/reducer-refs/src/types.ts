import {
  FormikValues,
  GetStateFn,
  FormikCoreApi,
  FormikState,
  FieldMetaProps,
  ValidateFormFn,
  FormikValidationConfig,
  FormikErrors,
  FormikTouched,
} from '@formik/core';

export interface FormikRefStateDecorator<Values> {
  initialValues: Values;
  initialErrors: FormikErrors<Values>;
  initialTouched: FormikTouched<Values>;
  initialStatus: any;
  dirty: boolean;
}

export type FormikRefState<Values> = FormikState<Values>
  & FormikRefStateDecorator<Values>;

export type GetRefStateFn<Values> = () => FormikRefState<Values>;

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
