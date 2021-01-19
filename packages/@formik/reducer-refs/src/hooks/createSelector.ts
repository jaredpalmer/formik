import { FormikValues, FormikState } from '@formik/core';

export type FormikSliceFn<Values, Return, State extends FormikState<Values>> = (
  state: State
) => Return;

export type FormikSelectorFn<
  Values extends FormikValues,
  Args extends any[],
  Return,
  State extends FormikState<Values>
> = (...args: Args) => FormikSliceFn<Values, Return, State>;

export type FormikSelector<
  Values extends FormikValues,
  Args extends any[],
  Return,
  State extends FormikState<Values>
> = {
  selector: FormikSelectorFn<Values, Args, Return, State>;
  args: Args;
};

export type CreateSelectorFn<
  Values extends FormikValues,
  State extends FormikState<Values>
> = <Args extends any[], Return>(
  selector: FormikSelectorFn<Values, Args, Return, State>,
  args: Args
) => FormikSelector<Values, Args, Return, State>;

export const selectCreateFormikSelector = <
  Values extends FormikValues,
  State extends FormikState<Values>
>(): CreateSelectorFn<Values, State> => (selector, args) => {
  return { selector, args };
};
