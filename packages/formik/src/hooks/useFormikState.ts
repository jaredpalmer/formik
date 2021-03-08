import { useOptimizedSelector, Selector, Comparer } from './useOptimizedSelector';
import { useFormikStateSubscription } from './useFormikSubscription';
import { FormikApi, useFormikApi } from './useFormikApi';
import { FormikState } from '../types';

/**
 * `useFormikState`, but accepting `FormikApi` as a parameter.
 *
 * @param api FormikApi instance returned by `useFormik` or `useFormikApi`
 */
export const useFormikApiState = <Values, Return>(
  api: FormikApi<Values>,
  selector: Selector<FormikState<Values>, Return>,
  comparer: Comparer<Return> = Object.is,
  shouldSubscribe = true
) => {
  selector = useOptimizedSelector(selector, comparer);

  return useFormikStateSubscription(
    api,
    selector,
    shouldSubscribe
  );
};

/**
 * Subscribe to Formik State and Computed State updates.
 */
export const useFormikState = <Values, Return>(
  selector: Selector<FormikState<Values>, Return>,
  comparer: Comparer<Return> = Object.is,
  shouldSubscribe = true
): [Return, FormikApi<Values>] => {
  const api = useFormikApi<Values>();
  return [
    useFormikApiState(api, selector, comparer, shouldSubscribe),
    api,
  ];
};
