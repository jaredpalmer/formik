import * as React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { connect } from './connect';
import {
  FormikContext,
  FormikState,
  SharedRenderProps,
  FormikProps,
} from './types';
import { getIn, isEmptyChildren, isFunction, setIn } from './utils';

export type FieldArrayRenderProps = ArrayHelpers & {
  form: FormikProps<any>;
  name: string;
};

export type FieldArrayConfig = {
  /** Really the path to the array field to be updated */
  name: string;
  /** Should field array validate the form AFTER array updates/changes? */
  validateOnChange?: boolean;
} & SharedRenderProps<FieldArrayRenderProps>;
export interface ArrayHelpers {
  /** Imperatively add a value to the end of an array */
  push: (obj: any, explicitValidation?: boolean) => void;
  /** Curried fn to add a value to the end of an array */
  handlePush: (obj: any, explicitValidation?: boolean) => () => void;
  /** Imperatively swap two values in an array */
  swap: (indexA: number, indexB: number, explicitValidation?: boolean) => void;
  /** Curried fn to swap two values in an array */
  handleSwap: (
    indexA: number,
    indexB: number,
    explicitValidation?: boolean
  ) => () => void;
  /** Imperatively move an element in an array to another index */
  move: (from: number, to: number, explicitValidation?: boolean) => void;
  /** Imperatively move an element in an array to another index */
  handleMove: (
    from: number,
    to: number,
    explicitValidation?: boolean
  ) => () => void;
  /** Imperatively insert an element at a given index into the array */
  insert: (index: number, value: any, explicitValidation?: boolean) => void;
  /** Curried fn to insert an element at a given index into the array */
  handleInsert: (
    index: number,
    value: any,
    explicitValidation?: boolean
  ) => () => void;
  /** Imperatively replace a value at an index of an array  */
  replace: (index: number, value: any, explicitValidation?: boolean) => void;
  /** Curried fn to replace an element at a given index into the array */
  handleReplace: (
    index: number,
    value: any,
    explicitValidation?: boolean
  ) => () => void;
  /** Imperatively add an element to the beginning of an array and return its length */
  unshift: (value: any, explicitValidation?: boolean) => number;
  /** Curried fn to add an element to the beginning of an array */
  handleUnshift: (value: any, explicitValidation?: boolean) => () => void;
  /** Curried fn to remove an element at an index of an array */
  handleRemove: (index: number, explicitValidation?: boolean) => () => void;
  /** Curried fn to remove a value from the end of the array */
  handlePop: (explicitValidation?: boolean) => () => void;
  /** Imperatively remove and element at an index of an array */
  remove<T>(index: number, explicitValidation?: boolean): T | undefined;
  /** Imperatively remove and return value from the end of the array */
  pop<T>(explicitValidation?: boolean): T | undefined;
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
    // @todo Fix TS 3.2.1
    this.remove = this.remove.bind(this) as any;
    this.pop = this.pop.bind(this) as any;
  }

  updateArrayField = (
    fn: Function,
    alterTouched: boolean | Function,
    alterErrors: boolean | Function,
    explicitValidation?: boolean
  ) => {
    const {
      name,
      validateOnChange,
      formik: { setFormikState, validateForm },
    } = this.props;
    setFormikState(
      (prevState: FormikState<any>) => {
        let updateErrors = typeof alterErrors === 'function' ? alterErrors : fn;
        let updateTouched =
          typeof alterTouched === 'function' ? alterTouched : fn;

        return {
          ...prevState,
          values: setIn(
            prevState.values,
            name,
            fn(getIn(prevState.values, name))
          ),
          errors: alterErrors
            ? setIn(
                prevState.errors,
                name,
                updateErrors(getIn(prevState.errors, name))
              )
            : prevState.errors,
          touched: alterTouched
            ? setIn(
                prevState.touched,
                name,
                updateTouched(getIn(prevState.touched, name))
              )
            : prevState.touched,
        };
      },
      () => {
        if (typeof explicitValidation === 'boolean') {
          if (explicitValidation) {
            validateForm();
          }
        } else if (validateOnChange) {
          validateForm();
        }
      }
    );
  };

  push = (value: any, explicitValidation?: boolean) =>
    this.updateArrayField(
      (array: any[]) => [...(array || []), cloneDeep(value)],
      false,
      false,
      explicitValidation
    );

  handlePush = (value: any, explicitValidation?: boolean) => () =>
    this.push(value, explicitValidation);

  swap = (indexA: number, indexB: number, explicitValidation?: boolean) =>
    this.updateArrayField(
      (array: any[]) => swap(array, indexA, indexB),
      true,
      true,
      explicitValidation
    );

  handleSwap = (
    indexA: number,
    indexB: number,
    explicitValidation?: boolean
  ) => () => this.swap(indexA, indexB, explicitValidation);

  move = (from: number, to: number, explicitValidation?: boolean) =>
    this.updateArrayField(
      (array: any[]) => move(array, from, to),
      true,
      true,
      explicitValidation
    );

  handleMove = (from: number, to: number, explicitValidation?: boolean) => () =>
    this.move(from, to, explicitValidation);

  insert = (index: number, value: any, explicitValidation?: boolean) =>
    this.updateArrayField(
      (array: any[]) => insert(array, index, value),
      (array: any[]) => insert(array, index, null),
      (array: any[]) => insert(array, index, null),
      explicitValidation
    );

  handleInsert = (
    index: number,
    value: any,
    explicitValidation?: boolean
  ) => () => this.insert(index, value, explicitValidation);

  replace = (index: number, value: any, explicitValidation?: boolean) =>
    this.updateArrayField(
      (array: any[]) => replace(array, index, value),
      false,
      false,
      explicitValidation
    );

  handleReplace = (
    index: number,
    value: any,
    explicitValidation?: boolean
  ) => () => this.replace(index, value, explicitValidation);

  unshift = (value: any, explicitValidation?: boolean) => {
    let length = -1;
    this.updateArrayField(
      (array: any[]) => {
        const arr = array ? [value, ...array] : [value];
        if (length < 0) {
          length = arr.length;
        }
        return arr;
      },
      (array: any[]) => {
        const arr = array ? [null, ...array] : [null];
        if (length < 0) {
          length = arr.length;
        }
        return arr;
      },
      (array: any[]) => {
        const arr = array ? [null, ...array] : [null];
        if (length < 0) {
          length = arr.length;
        }
        return arr;
      },
      explicitValidation
    );
    return length;
  };

  handleUnshift = (value: any, explicitValidation?: boolean) => () =>
    this.unshift(value, explicitValidation);

  remove<T>(index: number, explicitValidation?: boolean): T {
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
      true,
      explicitValidation
    );

    return result as T;
  }

  handleRemove = (index: number, explicitValidation?: boolean) => () =>
    this.remove<any>(index, explicitValidation);

  pop<T>(explicitValidation?: boolean): T {
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
      true,
      explicitValidation
    );

    return result as T;
  }

  handlePop = (explicitValidation?: boolean) => () =>
    this.pop<any>(explicitValidation);

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

    const props: FieldArrayRenderProps = {
      ...arrayHelpers,
      form: restOfFormik,
      name,
    };

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
