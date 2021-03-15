import { Selector, Comparer } from 'use-optimized-selector';
import { useFormikApi } from './useFormikApi';
import { FormikApi, FormikState } from '../types';

export const useFormikState = <Values, Return>(
  selector: Selector<FormikState<Values>, Return>,
  comparer?: Comparer<Return>,
  shouldSubscribe = true
): [Return, FormikApi<Values>] => {
  const api = useFormikApi<Values>();
  return [api.useState(selector, comparer, shouldSubscribe), api];
};
