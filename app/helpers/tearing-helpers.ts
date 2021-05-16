import { selectRange } from './array-helpers';
import { useState, useCallback, useMemo } from 'react';
import { useEffect } from 'react';

/**
 * Check if all elements show the same number.
 * https://github.com/dai-shi/will-this-react-global-state-work-in-concurrent-mode
 */
export const useCheckTearing = (elementCount: number, skip = 0) => {
  const ids = useMemo(() => selectRange(elementCount).slice(skip), [
    elementCount,
    skip,
  ]);
  const checkMatches = useCallback(() => {
    const [first, ...rest] = ids;
    const firstValue = document.querySelector(`#input-${first} code`)
      ?.innerHTML;
    return rest.every(id => {
      const thisValue = document.querySelector(`#input-${id} code`)?.innerHTML;
      const tore = thisValue !== firstValue;
      if (tore) {
        console.log('useCheckTearing: tore');
        console.log(thisValue);
        console.log(firstValue);
      }
      return !tore;
    });
  }, [ids]);
  const [didTear, setDidTear] = useState(false);

  // We won't create an infinite loop switching this boolean once, I promise.
  // (famous last words)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!didTear && !checkMatches()) {
      setDidTear(true);
    }
  });

  return didTear;
};
