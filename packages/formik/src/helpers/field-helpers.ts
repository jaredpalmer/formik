import { FieldMetaProps, FormikState } from "../types";
import { getIn } from "../utils";

export const selectFieldMetaByName = (name: string) => <
  Values,
  State extends FormikState<Values>
>(
  state: Pick<
    State,
    | 'values'
    | 'errors'
    | 'touched'
    | 'initialValues'
    | 'initialTouched'
    | 'initialErrors'
  >
) => ({
  value: getIn(state.values, name),
  error: getIn(state.errors, name),
  touched: !!getIn(state.touched, name),
  initialValue: getIn(state.initialValues, name),
  initialTouched: !!getIn(state.initialTouched, name),
  initialError: getIn(state.initialErrors, name),
});

/**
 * Example of an optimized comparer.
 */
export const fieldMetaIsEqual = <Value>(
  prev: FieldMetaProps<Value>,
  next: FieldMetaProps<Value>
) =>
  prev.value === next.value &&
  prev.touched === next.touched &&
  prev.error === next.error &&
  prev.initialValue === next.initialValue &&
  prev.initialTouched === next.initialTouched &&
  prev.initialError === next.initialError;
