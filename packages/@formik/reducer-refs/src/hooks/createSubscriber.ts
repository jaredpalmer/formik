import { FormikValues, FormikState } from '@formik/core';
import { FormikSelector, FormikSliceFn } from './createSelector';

export type FormikComparer<Return> = (prev: Return, next: Return) => boolean;

export type FormikSubscriber<
  Values extends FormikValues,
  Args extends any[],
  Return,
  State extends FormikState<Values>
> = {
  selector:
    | FormikSliceFn<Values, Return, State>
    | FormikSelector<Values, Args, Return, State>;
  comparer: FormikComparer<Return>;
};

export type CreateSubscriberFn<
  Values extends FormikValues,
  State extends FormikState<Values>
> = <Args extends any[], Return>(
  selector:
    | FormikSliceFn<Values, Return, State>
    | FormikSelector<Values, Args, Return, State>,
  comparer: FormikComparer<Return>
) => FormikSubscriber<Values, Args, Return, State>;

export const selectCreateFormikSubscriber = <
  Values extends FormikValues,
  State extends FormikState<Values>
>(): CreateSubscriberFn<Values, State> => (selector, comparer) => {
  return { selector, comparer };
};
