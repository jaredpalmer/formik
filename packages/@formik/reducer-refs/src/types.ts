import { CreateSelectorFn } from './hooks/createSelector';
import {
  FormikValues,
  FormikCoreApi,
  FormikState,
  ValidationHandler,
  FormikValidationConfig,
  FormikErrors,
  FormikTouched,
} from '@formik/core';
import { SubscribeFn } from './hooks/useSubscriptions';
import { CreateSubscriberFn } from './hooks/createSubscriber';
import { GetSelectorFn } from './helpers/subscription-helpers';

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
    subscribe: SubscribeFn<Values, FormikRefState<Values>>;
    getSelector: GetSelectorFn<Values, FormikRefState<Values>>;
    createSelector: CreateSelectorFn<Values, FormikRefState<Values>>;
    createSubscriber: CreateSubscriberFn<Values, FormikRefState<Values>>;
    validateForm: ValidationHandler<Values>;
  };
