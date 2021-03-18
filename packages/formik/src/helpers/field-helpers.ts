import { FormikState } from "../types";
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
    FormikState<Values>,
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
