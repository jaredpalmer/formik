import { FormikState, FormikErrors, FormikTouched } from '@formik/core';

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
