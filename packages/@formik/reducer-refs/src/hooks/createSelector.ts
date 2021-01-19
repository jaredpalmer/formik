import { FormikValues, FormikState } from '@formik/core';

export type FormikSliceFn<Values, Return, State = FormikState<Values>> = (
  state: State
) => Return;

export type FormikSelectorFn<
  Values extends FormikValues,
  Args extends any[],
  Return,
  State = FormikState<Values>
> = (...args: Args) => FormikSliceFn<Values, Return, State>;

export type FormikMemoizedSelector<
  Values extends FormikValues,
  Args extends any[],
  Return,
  State = FormikState<Values>
> = {
  selector: FormikSelectorFn<Values, Args, Return, State>;
  args: Args;
};

export type FormikSelector<
  Values extends FormikValues,
  Args extends any[],
  Return,
  State = FormikState<Values>
> =
  | FormikSliceFn<Values, Return, State>
  | FormikMemoizedSelector<Values, Args, Return, State>;

export const createFormikSelector = <
  Values extends FormikValues,
  Args extends any[],
  Return,
  State = FormikState<Values>
>(
  selector: FormikSelector<Values, Args, Return, State>,
  args: Args
) => {
  return {
    selector,
    args,
  };
};
