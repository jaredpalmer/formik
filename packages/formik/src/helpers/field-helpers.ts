import { FormikReducerState } from "../types";
import { getIn } from "../utils";

/**
 * @internal
 *
 * Get FieldMetaProps from state.
 */
export const selectFieldMetaByName = <
Values
>(name: string) => (
  state: Pick<
    FormikReducerState<Values>,
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

export const defaultParseFn = (value: unknown, _name: string) => value;

export const numberParseFn = (value: any, _name: string) => {
  const parsed = parseFloat(value);

  return isNaN(parsed) ? '' : parsed;
};

export const defaultFormatFn = (value: unknown, _name: string) =>
  value === undefined ? '' : value;
