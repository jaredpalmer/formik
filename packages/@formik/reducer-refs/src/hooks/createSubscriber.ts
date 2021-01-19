import { FormikValues, FormikState } from '@formik/core';
import { FormikSelector, FormikSliceFn } from './createSelector';

export type FormikComparer<Return> = (prev: Return, next: Return) => boolean;
export type FormikSubscriber<
  Values extends FormikValues,
  Args extends any[],
  Return,
  State = FormikState<Values>
> = {
  selector:
    | FormikSliceFn<Values, Return, State>
    | FormikSelector<Values, Args, Return, State>;
  comparer: FormikComparer<Return>;
};

export type FormikSubscriberMap<Values, State = FormikState<Values>> = Map<
  FormikSelector<Values, any, any, State>,
  Map<FormikComparer<any>, FormikSubscriber<Values, any, any, State>>
>;

export type UnsubscribeFn = () => void;

export const createFormikSubscriber = <
  Values extends FormikValues,
  Args extends any[],
  Return,
  State = FormikState<Values>
>(
  subscriber: FormikSubscriber<Values, Args, Return, State>,
  comparer: FormikComparer<Return>
) => {
  return { subscriber, comparer };
};
