import {
  FormikValues,
  FormikCoreApi,
  FormikState,
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

export type FormikRefApi<Values extends FormikValues> = FormikCoreApi<Values> &
  FormikValidationConfig & {
    getState: GetRefStateFn<Values>;
    /**
     * Note: Effects added here should be optimized so they don't
     * update state unnecessarily. @see useFormikStateSlice
     */
    addFormEffect: (effect: FormEffect<Values>) => UnsubscribeFn;
    validateForm: ValidationHandler<Values>;
  };
