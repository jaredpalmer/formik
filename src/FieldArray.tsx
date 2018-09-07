import * as React from 'react';
import cloneDeep from 'lodash.clonedeep';
import { connect } from './connect';
import {
  FormikContext,
  FormikState,
  SharedRenderProps,
  FormikProps,
} from './types';
import { getIn, isEmptyChildren, isFunction, setIn } from './utils';

export type FieldArrayConfig = {
  /** Really the path to the array field to be updated */
  name: string;
  /** Should field array validate the form AFTER array updates/changes? */
  validateOnChange?: boolean;
} & SharedRenderProps<ArrayHelpers & { form: FormikProps<any> }>;
export interface ArrayHelpers {
  /** Imperatively add a value to the end of an array */
  push: (obj: any) => void;
  /** Curried fn to add a value to the end of an array */
  handlePush: (obj: any) => () => void;
  /** Imperatively swap two values in an array */
  swap: (indexA: number, indexB: number) => void;
  /** Curried fn to swap two values in an array */
  handleSwap: (indexA: number, indexB: number) => () => void;
  /** Imperatively move an element in an array to another index */
  move: (from: number, to: number) => void;
  /** Imperatively move an element in an array to another index */
  handleMove: (from: number, to: number) => () => void;
  /** Imperatively insert an element at a given index into the array */
  insert: (index: number, value: any) => void;
  /** Curried fn to insert an element at a given index into the array */
  handleInsert: (index: number, value: any) => () => void;
  /** Imperatively replace a value at an index of an array  */
  replace: (index: number, value: any) => void;
  /** Curried fn to replace an element at a given index into the array */
  handleReplace: (index: number, value: any) => () => void;
  /** Imperatively add an element to the beginning of an array and return its length */
  unshift: (value: any) => number;
  /** Curried fn to add an element to the beginning of an array */
  handleUnshift: (value: any) => () => void;
  /** Curried fn to remove an element at an index of an array */
  handleRemove: (index: number) => () => void;
  /** Curried fn to remove a value from the end of the array */
  handlePop: () => () => void;
  /** Imperatively remove and element at an index of an array */
  remove<T>(index: number): T | undefined;
  /** Imperatively remove and return value from the end of the array */
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

export const replace = (array: any[], index: number, value: any) => {
  const copy = [...(array || [])];
  copy[index] = value;
  return copy;
};
class FieldArrayInner<Values = {}> extends React.Component<
  FieldArrayConfig & { formik: FormikContext<Values> },
  {}
> {
  static defaultProps = {
    validateOnChange: true,
  };

  constructor(props: FieldArrayConfig & { formik: FormikContext<Values> }) {
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
      name,
      validateOnChange,
      formik: { setFormikState, validateForm, values, touched, errors },
    } = this.props;
    setFormikState(
      (prevState: FormikState<any>) => ({
        ...prevState,
        values: setIn(prevState.values, name, fn(getIn(values, name))),
        errors: alterErrors
          ? setIn(prevState.errors, name, fn(getIn(errors, name)))
          : prevState.errors,
        touched: alterTouched
          ? setIn(prevState.touched, name, fn(getIn(touched, name)))
          : prevState.touched,
      }),
      () => {
        if (validateOnChange) {
          validateForm();
        }
      }
    );
  };

  push = (value: any) =>
    this.updateArrayField(
      (array: any[]) => [...(array || []), cloneDeep(value)],
      false,
      false
    );

  handlePush = (value: any) => () => this.push(value);

  swap = (indexA: number, indexB: number) =>
    this.updateArrayField(
      (array: any[]) => swap(array, indexA, indexB),
      false,
      false
    );

  handleSwap = (indexA: number, indexB: number) => () =>
    this.swap(indexA, indexB);

  move = (from: number, to: number) =>
    this.updateArrayField(
      (array: any[]) => move(array, from, to),
      false,
      false
    );

  handleMove = (from: number, to: number) => () => this.move(from, to);

  insert = (index: number, value: any) =>
    this.updateArrayField(
      (array: any[]) => insert(array, index, value),
      false,
      false
    );

  handleInsert = (index: number, value: any) => () => this.insert(index, value);

  replace = (index: number, value: any) =>
    this.updateArrayField(
      (array: any[]) => replace(array, index, value),
      false,
      false
    );

  handleReplace = (index: number, value: any) => () =>
    this.replace(index, value);

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

  handleUnshift = (value: any) => () => this.unshift(value);

  remove<T>(index: number): T {
    // We need to make sure we also remove relevant pieces of `touched` and `errors`
    let result: any;
    this.updateArrayField(
      // so this gets call 3 times
      (array?: any[]) => {
        const copy = array ? [...array] : [];
        if (!result) {
          result = copy[index];
        }
        if (isFunction(copy.splice)) {
          copy.splice(index, 1);
        }
        return copy;
      },
      true,
      true
    );

    return result;
  }

  handleRemove = (index: number) => () => this.remove<any>(index);

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

  handlePop = () => () => this.pop<any>();

  render() {
    const arrayHelpers: ArrayHelpers = {
      push: this.push,
      pop: this.pop,
      swap: this.swap,
      move: this.move,
      insert: this.insert,
      replace: this.replace,
      unshift: this.unshift,
      remove: this.remove,
      handlePush: this.handlePush,
      handlePop: this.handlePop,
      handleSwap: this.handleSwap,
      handleMove: this.handleMove,
      handleInsert: this.handleInsert,
      handleReplace: this.handleReplace,
      handleUnshift: this.handleUnshift,
      handleRemove: this.handleRemove,
    };

    const {
      component,
      render,
      children,
      name,
      formik: {
        validate: _validate,
        validationSchema: _validationSchema,
        ...restOfFormik
      },
    } = this.props;

    const props = { ...arrayHelpers, form: restOfFormik, name };

    return component
      ? React.createElement(component as any, props)
      : render
        ? (render as any)(props)
        : children // children come last, always called
          ? typeof children === 'function'
            ? (children as any)(props)
            : !isEmptyChildren(children) ? React.Children.only(children) : null
          : null;
  }
}

export const FieldArray = connect<FieldArrayConfig, any>(FieldArrayInner);
