import { Selector, Comparer } from './useOptimizedSelector';
import { useFormikContext } from '../FormikContext';
import { FormikApi, FormikState } from '../types';

/**
 * @see {@link FormikApi['useState']} for info on using Formik's State.
 */
export const useFormikState = <Values, Return>(
  selector: Selector<FormikState<Values>, Return>,
  comparer?: Comparer<Return>,
  shouldSubscribe = true
): [Return, FormikApi<Values>] => {
  const api = useFormikContext<Values>();
  return [api.useState(selector, comparer, shouldSubscribe), api];
};
