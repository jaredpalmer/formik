import { Selector, Comparer } from 'use-optimized-selector';
import { useFormikContext } from '../FormikContext';
import { FormikApi, FormikReducerState } from '../types';

/**
 * Use Formik State from within Render.
 *
 * @param selector a memoized or constant function like `state => state.isSubmitting`
 * @param comparer an optional comparer, for checking whether previous and next selector results are equal
 * @param shouldSubscribe a bail-out for when the value doesn't need to be updated after the initial render. enables optional subscriptions for `render` props.
 */
export const useFormikState = <Values, Return>(
  selector: Selector<FormikReducerState<Values>, Return>,
  comparer?: Comparer<Return>,
  shouldSubscribe = true
): [Return, FormikApi<Values>] => {
  const api = useFormikContext<Values>();
  return [api.useState(selector, comparer, shouldSubscribe), api];
};
