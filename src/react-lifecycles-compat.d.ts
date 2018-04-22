declare module 'react-lifecycles-compat' {
  import * as React from 'react';
  export function polyfill<P>(
    Comp: React.ComponentType<P>
  ): React.ComponentType<P>;
}
