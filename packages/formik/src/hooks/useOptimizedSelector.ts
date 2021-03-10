import { useMemo } from 'react';

export type Selector<Value, Return> = (value: Value) => Return;
export type Comparer<Return> = (prev: Return, next: Return) => boolean;

const UNINITIALIZED_VALUE = Symbol();

export const useOptimizedSelector = <Value, Return>(
  selector: Selector<Value, Return>,
  comparer: Comparer<Return>
): Selector<Value, Return> => {
  return useMemo(() => {
    let cachedValue: Return | typeof UNINITIALIZED_VALUE = UNINITIALIZED_VALUE;

    return (value: Value) => {
      const newValue = selector(value);

      if (
        cachedValue === UNINITIALIZED_VALUE ||
        !comparer(cachedValue, newValue)
      ) {
        cachedValue = newValue;
      }

      return cachedValue;
    };
  }, [selector, comparer]);
};
