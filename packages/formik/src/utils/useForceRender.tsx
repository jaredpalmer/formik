import * as React from 'react';
const noopReducer = (s: number) => s + 1;
export function useForceRender() {
  const [, forceRender] = React.useReducer(noopReducer, 0);
  return forceRender;
}
