import * as React from 'react';
import { FieldMetaProps, FormikApi, PathMatchingValue } from './types';

export type TypedFieldArray<Values> = <Value>(
  props: FieldArrayConfig<Value, Values>
) =>
  React.ReactElement | null;

export interface UseFieldArrayConfig<Value = any, Values = any> {
  /** Really the path to the array field to be updated */
  name: PathMatchingValue<Value[], Values>;
  /** Should field array validate the form AFTER array updates/changes? */
  validateOnChange?: boolean;
}

export interface ArrayHelpers<Value> {
  /** Imperatively add a value to the end of an array */
  push: (obj: Value) => void;
  /** Curried fn to add a value to the end of an array */
  handlePush: (obj: Value) => () => void;
  /** Imperatively swap two values in an array */
  swap: (indexA: number, indexB: number) => void;
  /** Curried fn to swap two values in an array */
  handleSwap: (indexA: number, indexB: number) => () => void;
  /** Imperatively move an element in an array to another index */
  move: (from: number, to: number) => void;
  /** Imperatively move an element in an array to another index */
  handleMove: (from: number, to: number) => () => void;
  /** Imperatively insert an element at a given index into the array */
  insert: (index: number, value: Value) => void;
  /** Curried fn to insert an element at a given index into the array */
  handleInsert: (index: number, value: Value) => () => void;
  /** Imperatively replace a value at an index of an array  */
  replace: (index: number, value: Value) => void;
  /** Curried fn to replace an element at a given index into the array */
  handleReplace: (index: number, value: Value) => () => void;
  /** Imperatively add an element to the beginning of an array and return its length */
  unshift: (value: Value) => number;
  /** Curried fn to add an element to the beginning of an array */
  handleUnshift: (value: Value) => () => void;
  /** Curried fn to remove an element at an index of an array */
  handleRemove: (index: number) => () => void;
  /** Curried fn to remove a value from the end of the array */
  handlePop: () => () => void;
  /** Imperatively remove and element at an index of an array */
  remove(index: number): Value | undefined;
  /** Imperatively remove and return value from the end of the array */
  pop(): Value | undefined;
}

export interface FieldArrayProps<Value, Values> extends
  ArrayHelpers<Value>
{
  form: FormikApi<Values>;
  field: FieldMetaProps<Value[]>;
  name: PathMatchingValue<Value[], Values>;
};

export interface FieldArrayConfig<Value, Values> extends
  UseFieldArrayConfig<Value, Values>
{
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: React.ComponentType<FieldArrayProps<Value, Values>>;

  /**
    * Render prop (works like React router's <Route render={props =>} />)
    */
  render?: (props: FieldArrayProps<Value, Values>) => React.ReactElement | null;

  /**
    * Children render function <Field name>{props => ...}</Field>)
    */
  children?: (props: FieldArrayProps<Value, Values>) => React.ReactElement | null;
};
