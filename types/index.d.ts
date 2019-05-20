declare module 'react-testing-library';
declare module 'tiny-warning' {
  export default function warning(condition: any, message: string): void;
}

declare module 'react-lifecycles-compat' {
  import React from 'react';
  export function polyfill<P>(
    Comp: React.ComponentType<P>
  ): React.ComponentType<P>;
}

declare module 'deepmerge' {
  export = deepmerge;

  function deepmerge<T>(
    x: Partial<T>,
    y: Partial<T>,
    options?: deepmerge.Options
  ): T;
  function deepmerge<T1, T2>(
    x: T1,
    y: T2,
    options?: deepmerge.Options
  ): T1 & T2;

  namespace deepmerge {
    interface Options {
      clone?: boolean;
      arrayMerge?(destination: any[], source: any[], options?: Options): any[];
      isMergeableObject?(value: object): boolean;
    }

    function all<T>(objects: Array<Partial<T>>, options?: Options): T;
  }
}
declare module 'scheduler';
