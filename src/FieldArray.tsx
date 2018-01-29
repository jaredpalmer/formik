import * as React from 'react';
import { dlv } from './utils';
import { SharedRenderProps } from './types';
import * as PropTypes from 'prop-types';
import { FormikProps } from './formik';

export type FieldArrayConfig = {
  /** Really the path to the array field to be updated */
  name: string;
} & SharedRenderProps<ArrayHelpers & { form: FormikProps<any> }>;

export interface ArrayHelpers {
  /** Add a value to the end of an array */
  push: (obj: any) => void;
  /** Swap two values in an array */
  swap: (indexA: number, indexB: number) => void;
  /** Move an element in an array to another index */
  move: (from: number, to: number) => void;
  /** Insert an element at a given index into the array */
  insert: (index: number, value: any) => void;
  /** Add an element to the beginning of an array and return its length */
  unshift: (value: any) => number;
  /** Remove and element at an index of an array */
  remove<T>(index: number): T | undefined;
  /** Remove and return value from the end of the array */
  pop<T>(): T | undefined;
}

/**
 * Some array helpers!
 */
export const move = (array: any[], from: number, to: number) => {
  const copy = [...(array || [])];
  const value = copy[from];
  copy.splice(from, 1);
  copy.splice(to, 0, value);
  return copy;
};

export const swap = (array: any[], indexA: number, indexB: number) => {
  const copy = [...(array || [])];
  const a = copy[indexA];
  copy[indexA] = copy[indexB];
  copy[indexB] = a;
  return copy;
};

export const insert = (array: any[], index: number, value: any) => {
  const copy = [...(array || [])];
  copy.splice(index, 0, value);
  return copy;
};

export class FieldArray extends React.Component<FieldArrayConfig, {}> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  changeValue = (fn: Function) => {
    const { setFieldValue, values } = this.context.formik;
    const { name } = this.props;
    const val = fn(dlv(values, name));
    setFieldValue(name, val);
  };

  push = (value: any) => this.changeValue((array: any[]) => [...array, value]);

  swap = (indexA: number, indexB: number) =>
    this.changeValue((array: any[]) => swap(array, indexA, indexB));

  move = (from: number, to: number) =>
    this.changeValue((array: any[]) => move(array, from, to));

  insert = (index: number, value: any) =>
    this.changeValue((array: any[]) => insert(array, index, value));

  unshift = (value: any) => {
    let arr = [];
    this.changeValue((array: any[]) => {
      arr = array ? [value, ...array] : [value];
      return arr;
    });
    return arr.length;
  };

  remove = (index: number) => {
    let result;
    this.changeValue((array: any[]) => {
      const copy = [...(array || [])];
      result = copy[index];
      copy.splice(index, 1);
      return copy;
    });
    return result;
  };

  pop = () => {
    let result;
    this.changeValue((array: any[]) => {
      const tmp = array;
      result = tmp.pop();
      return tmp;
    });
    return result;
  };

  render() {
    const arrayHelpers: ArrayHelpers = {
      push: this.push,
      pop: this.pop,
      swap: this.swap,
      move: this.move,
      insert: this.insert,
      unshift: this.unshift,
      remove: this.remove,
    };

    const { component, render } = this.props;
    const props = { ...arrayHelpers, form: this.context.formik };

    if (component) {
      return React.createElement(component as any, props);
    }

    return render ? (render as any)(props) : null;
  }
}
