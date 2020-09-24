import { useState, useCallback } from 'react';

interface BooleanUpdater {
  setValue: (value: boolean) => void;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

export const useBoolean = (initial: boolean) => {
  const [value, setValue] = useState(initial);
  return [
    value,
    {
      setValue,
      toggle: useCallback(() => setValue(v => !v), []),
      setTrue: useCallback(() => setValue(true), []),
      setFalse: useCallback(() => setValue(false), []),
    },
  ] as [boolean, BooleanUpdater];
};
