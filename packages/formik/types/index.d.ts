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

declare module 'scheduler' {
  export const unstable_NoPriority = 0;
  export const unstable_ImmediatePriority = 1;
  export const unstable_UserBlockingPriority = 2;
  export const unstable_NormalPriority = 3;
  export const unstable_LowPriority = 4;
  export const unstable_IdlePriority = 5;

  export function unstable_runWithPriority<T>(
    priorityLevel: number,
    eventHandler: () => T
  ): T;

  export interface Task {
    id: number;
  }

  export interface ScheduleCallbackOptions {
    delay?: number;
  }

  export function unstable_scheduleCallback(
    priorityLevel: number,
    callback: () => void,
    options?: ScheduleCallbackOptions
  ): Task;

  export function unstable_cancelCallback(task: Task): void;
}
