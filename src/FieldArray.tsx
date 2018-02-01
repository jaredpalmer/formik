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

  constructor(props: FieldArrayConfig) {
    super(props);
    // We need TypeScript generics on these, so we'll bind them in the constructor
    this.remove = this.remove.bind(this);
    this.pop = this.pop.bind(this);
  }

  updateArrayField = (
    fn: Function,
    alterTouched: boolean,
    alterErrors: boolean
  ) => {
    const {
      setFieldTouched,
      setFieldValue,
      setFieldError,
      values,
      touched,
      errors,
    } = this.context.formik;
    const { name } = this.props;
    setFieldValue(name, fn(dlv(values, name)));

    if (alterErrors) {
      setFieldError(name, fn(dlv(errors, name)));
    }

    if (alterTouched) {
      setFieldTouched(name, fn(dlv(touched, name)));
    }
  };

  push = (value: any) =>
    this.updateArrayField((array: any[]) => [...array, value], false, false);

  swap = (indexA: number, indexB: number) =>
    this.updateArrayField(
      (array: any[]) => swap(array, indexA, indexB),
      false,
      false
    );

  move = (from: number, to: number) =>
    this.updateArrayField(
      (array: any[]) => move(array, from, to),
      false,
      false
    );

  insert = (index: number, value: any) =>
    this.updateArrayField(
      (array: any[]) => insert(array, index, value),
      false,
      false
    );

  unshift = (value: any) => {
    let arr = [];
    this.updateArrayField(
      (array: any[]) => {
        arr = array ? [value, ...array] : [value];
        return arr;
      },
      false,
      false
    );
    return arr.length;
  };

  remove<T>(index: number): T {
    // We need to make sure we also remove relevant pieces of `touched` and `errors`
    let result: any;
    this.updateArrayField(
      // so this gets call 3 times
      (array: any[]) => {
        const copy = [...(array || [])];
        if (!result) {
          result = copy[index];
        }
        copy.splice(index, 1);
        return copy;
      },
      true,
      true
    );

    return result;
  }

  pop<T>(): T {
    // Remove relevant pieces of `touched` and `errors` too!
    let result: any;
    this.updateArrayField(
      // so this gets call 3 times
      (array: any[]) => {
        const tmp = array;
        if (!result) {
          result = tmp && tmp.pop && tmp.pop();
        }
        return tmp;
      },
      true,
      true
    );

    return result;
  }

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
