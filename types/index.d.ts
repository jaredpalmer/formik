declare module '@pisano/enzyme';
declare module '@pisano/enzyme-adapter-react-16';
declare module 'react-lifecycles-compat' {
  import React from 'react';
  export function polyfill<P>(
    Comp: React.ComponentType<P>
  ): React.ComponentType<P>;
}
declare module 'deepmerge' {
  // https://github.com/KyleAMathews/deepmerge
  // 06/27/18 by Jared Palmer
  // for Version 2.1.1
  export default function deepmerge<T>(
    x: any,
    y: any,
    options?: {
      clone?: boolean;
      arrayMerge?: (x: any[], y: any[], option: { clone?: boolean }) => any[];
      isMergeableObject?: (obj: any) => boolean;
    }
  ): T;
}
