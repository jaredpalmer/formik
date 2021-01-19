import { useRef, useEffect } from 'react';

/**
 * https://stackoverflow.com/a/51082563/1639736
 */
export function usePropChangeLogger<Shape extends object>(props: Shape) {
  const prev = useRef<Record<string, any>>(props);

  useEffect(() => {
    const changedProps = Object.entries(props).reduce<
      Record<string, [any, any]>
    >((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});

    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }

    prev.current = props;
  });
}
