declare module '@pisano/enzyme';
declare module '@pisano/enzyme-adapter-react-16';
declare module 'react-lifecycles-compat' {
  import React from 'react';
  export function polyfill<P>(
    Comp: React.ComponentType<P>
  ): React.ComponentType<P>;
}
