import * as React from 'react';
import { FormikContext, SharedRenderProps, FormikProps } from './types';
export declare type FieldArrayConfig = {
  name: string;
  validateOnChange?: boolean;
} & SharedRenderProps<
  ArrayHelpers & {
    form: FormikProps<any>;
  }
>;
export interface ArrayHelpers {
  push: (obj: any) => void;
  handlePush: (obj: any) => () => void;
  swap: (indexA: number, indexB: number) => void;
  handleSwap: (indexA: number, indexB: number) => () => void;
  move: (from: number, to: number) => void;
  handleMove: (from: number, to: number) => () => void;
  insert: (index: number, value: any) => void;
  handleInsert: (index: number, value: any) => () => void;
  replace: (index: number, value: any) => void;
  handleReplace: (index: number, value: any) => () => void;
  unshift: (value: any) => number;
  handleUnshift: (value: any) => () => void;
  handleRemove: (index: number) => () => void;
  handlePop: () => () => void;
  remove<T>(index: number): T | undefined;
  pop<T>(): T | undefined;
}
export declare const move: (array: any[], from: number, to: number) => any[];
export declare const swap: (
  array: any[],
  indexA: number,
  indexB: number
) => any[];
export declare const insert: (array: any[], index: number, value: any) => any[];
export declare const replace: (
  array: any[],
  index: number,
  value: any
) => any[];
export declare const FieldArray: React.ComponentClass<FieldArrayConfig> & {
  WrappedComponent: React.ComponentClass<
    {
      name: string;
      validateOnChange?: boolean | undefined;
    } & SharedRenderProps<
      ArrayHelpers & {
        form: FormikProps<any>;
      }
    > & {
        formik: FormikContext<any>;
      }
  >;
};
