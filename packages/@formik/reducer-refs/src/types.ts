import {
  FormikValues,
  FormikCoreApi,
  FormikState,
  FieldMetaProps,
  ValidationHandler,
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

export type FormikRefState<Values> = FormikState<Values> &
  FormikRefStateDecorator<Values>;

export type GetRefStateFn<Values> = () => FormikRefState<Values>;

export type FormEffect<Values extends FormikValues> = (
  state: FormikRefState<Values>
) => void;
export type FieldEffect<Value> = (state: FieldMetaProps<Value>) => void;
export type UnsubscribeFn = () => void;

export type FormikRefApi<Values extends FormikValues> = FormikCoreApi<Values> &
  FormikValidationConfig & {
    getState: GetRefStateFn<Values>;
    addFormEffect: (effect: FormEffect<Values>) => UnsubscribeFn;
    validateForm: ValidationHandler<Values>;
  };
