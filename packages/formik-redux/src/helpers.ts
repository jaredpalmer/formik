import { useLayoutEffect, useEffect, useRef, useCallback } from 'react';

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
// @see https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? useLayoutEffect
    : useEffect;

export function useEventCallback<Args extends any[], Return>(fn: (...args: Args) => Return, dependencies: any[]) {  
    const ref = useRef(fn);
  
    useIsomorphicLayoutEffect(() => {
      ref.current = fn;
    }, [fn, ...dependencies]);
  
    return useCallback((...args: Args) => {
      const fn = ref.current;
      
      return fn(...args);
    }, [ref]);
  }
  
export const isSyntheticEvent = (value: any): value is React.ChangeEvent<any> =>
  typeof value === 'object' && typeof value.persist === 'function';
