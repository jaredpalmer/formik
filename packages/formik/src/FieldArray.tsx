import * as React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { arraySwap, arrayMove, arrayInsert, arrayReplace, copyArrayLike } from './helpers/array-helpers';
import { useFormikConfig, useFormikContext } from './FormikContext';
import { FieldMetaProps, FieldValue, FormikApi, FormikReducerState, FormikValues } from './types';
import { useEventCallback } from './hooks/useEventCallback';
import { getIn, isEmptyArray, isEmptyChildren, isFunction, setIn } from './utils';
import { useFieldMeta } from './hooks/hooks';

export type FieldArrayValue<Values, Path extends string> =
  FieldValue<Values, Path> extends unknown[]
    ? FieldValue<Values, Path>
    : never;

export type FieldArrayName<Values, Path extends string> =
  FieldValue<Values, Path> extends never ? never : Path;

export interface UseFieldArrayProps<Values = any, Path extends string = any> {
  /** Really the path to the array field to be updated */
  name: FieldArrayName<Values, Path>;
  /** Should field array validate the form AFTER array updates/changes? */
  validateOnChange?: boolean;
}

export interface ArrayHelpers<Values, Path extends string> {
  /** Imperatively add a value to the end of an array */
  push: (obj: FieldArrayValue<Values, Path>[number]) => void;
  /** Curried fn to add a value to the end of an array */
  handlePush: (obj: FieldArrayValue<Values, Path>[number]) => () => void;
  /** Imperatively swap two values in an array */
  swap: (indexA: number, indexB: number) => void;
  /** Curried fn to swap two values in an array */
  handleSwap: (indexA: number, indexB: number) => () => void;
  /** Imperatively move an element in an array to another index */
  move: (from: number, to: number) => void;
  /** Imperatively move an element in an array to another index */
  handleMove: (from: number, to: number) => () => void;
  /** Imperatively insert an element at a given index into the array */
  insert: (index: number, value: FieldArrayValue<Values, Path>[number]) => void;
  /** Curried fn to insert an element at a given index into the array */
  handleInsert: (index: number, value: FieldArrayValue<Values, Path>[number]) => () => void;
  /** Imperatively replace a value at an index of an array  */
  replace: (index: number, value: FieldArrayValue<Values, Path>[number]) => void;
  /** Curried fn to replace an element at a given index into the array */
  handleReplace: (index: number, value: FieldArrayValue<Values, Path>[number]) => () => void;
  /** Imperatively add an element to the beginning of an array and return its length */
  unshift: (value: FieldArrayValue<Values, Path>[number]) => number;
  /** Curried fn to add an element to the beginning of an array */
  handleUnshift: (value: FieldArrayValue<Values, Path>[number]) => () => void;
  /** Curried fn to remove an element at an index of an array */
  handleRemove: (index: number) => () => void;
  /** Curried fn to remove a value from the end of the array */
  handlePop: () => () => void;
  /** Imperatively remove and element at an index of an array */
  remove<T>(index: number): T | undefined;
  /** Imperatively remove and return value from the end of the array */
  pop(): FieldArrayValue<Values, Path>[number] | undefined;
}

type UpdateFieldArrayFn<Values, Path extends string> = (
  array: FieldArrayValue<Values, Path> | boolean[]
) => void;

export const useFieldArray = <Values extends FormikValues = any, Path extends string = any>(
  props: UseFieldArrayProps<Values, Path>
): [
  FieldMetaProps<FieldArrayValue<Values, Path>>,
  ArrayHelpers<Values, Path>,
  FormikApi<Values>
] => {
  const formik = useFormikContext<Values>();
  const { setFormikState } = formik;
  const fieldMeta = useFieldMeta<FieldArrayValue<Values, Path>>(props.name);

  const updateArrayField = useEventCallback(
    (
      // eslint-disable-next-line @typescript-eslint/ban-types
      fn: UpdateFieldArrayFn<Values, Path>,
      // eslint-disable-next-line @typescript-eslint/ban-types
      alterTouched: boolean | UpdateFieldArrayFn<Values, Path>,
      // eslint-disable-next-line @typescript-eslint/ban-types
      alterErrors: boolean | UpdateFieldArrayFn<Values, Path>
    ) => {
      const name = props.name;

      setFormikState((prevState: FormikReducerState<Values>) => {
        const updateErrors =
          typeof alterErrors === 'function' ? alterErrors : fn;
        const updateTouched =
          typeof alterTouched === 'function' ? alterTouched : fn;

        // values fn should be executed before updateErrors and updateTouched,
        // otherwise it causes an error with unshift.
        const values = setIn(
          prevState.values,
          name,
          fn(getIn(prevState.values, name))
        );

        let fieldError = alterErrors
          ? updateErrors(getIn(prevState.errors, name))
          : undefined;
        let fieldTouched = alterTouched
          ? updateTouched(getIn(prevState.touched, name))
          : undefined;

        if (isEmptyArray(fieldError)) {
          fieldError = undefined;
        }
        if (isEmptyArray(fieldTouched)) {
          fieldTouched = undefined;
        }

        return {
          ...prevState,
          values,
          errors: alterErrors
            ? setIn(prevState.errors, name, fieldError)
            : prevState.errors,
          touched: alterTouched
            ? setIn(prevState.touched, name, fieldTouched)
            : prevState.touched,
        };
      });
    }
  );

  const push = useEventCallback<ArrayHelpers<Values, Path>['push']>(
    (value) =>
      updateArrayField(
        (arrayLike: ArrayLike<any>) => [
          ...copyArrayLike(arrayLike),
          cloneDeep(value),
        ],
        false,
        false
      )
  );

  const handlePush = useEventCallback<ArrayHelpers<Values, Path>['handlePush']>(
    (value) => () => push(value),
  );

  const swap = useEventCallback<ArrayHelpers<Values, Path>['swap']>(
    (indexA, indexB) =>
      updateArrayField(
        (array: any[]) => arraySwap(array, indexA, indexB),
        true,
        true
      )
  );

  const handleSwap = useEventCallback<ArrayHelpers<Values, Path>['handleSwap']>(
    (indexA, indexB) => () => swap(indexA, indexB)
  );

  const move = useEventCallback(
    (from: number, to: number) =>
      updateArrayField(
        (array: any[]) => arrayMove(array, from, to),
        true,
        true
      )
  );

  const handleMove = useEventCallback<ArrayHelpers<Values, Path>['handleMove']>(
    (from: number, to: number) => () => move(from, to)
  );

  const insert = useEventCallback<ArrayHelpers<Values, Path>['insert']>(
    (index: number, value: any) =>
      updateArrayField(
        (array: any[]) => arrayInsert(array, index, value),
        (array: any[]) => arrayInsert(array, index, null),
        (array: any[]) => arrayInsert(array, index, null)
      )
  );

  const handleInsert = useEventCallback<ArrayHelpers<Values, Path>['handleInsert']>(
    (index: number, value: any) => () => insert(index, value)
  );

  const replace = useEventCallback<ArrayHelpers<Values, Path>['replace']>(
    (index: number, value: any) =>
      updateArrayField(
        (array: any[]) => arrayReplace(array, index, value),
        false,
        false
      )
  );

  const handleReplace = useEventCallback<ArrayHelpers<Values, Path>['handleReplace']>(
    (index: number, value: any) => () => replace(index, value)
  );

  const unshift = useEventCallback<ArrayHelpers<Values, Path>['unshift']>(
    (value: any) => {
      let length = -1;
      updateArrayField(
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
        }
      );
      return length;
    }
  );

  const handleUnshift = useEventCallback<ArrayHelpers<Values, Path>['handleUnshift']>(
    (value: any) => () => unshift(value)
  );

  const remove = useEventCallback<ArrayHelpers<Values, Path>['remove']>(
    <T,>(index: number): T => {
      // We need to make sure we also remove relevant pieces of `touched` and `errors`
      let result: any;
      updateArrayField(
        // so this gets call 3 times
        (array?: any[]) => {
          const copy = array ? copyArrayLike(array) : [];
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

      return result as T;
    }
  );

  const handleRemove = useEventCallback<ArrayHelpers<Values, Path>['handleRemove']>(
    (index: number) => () => remove<any>(index)
  );

  const pop = useEventCallback<ArrayHelpers<Values, Path>['pop']>(
    () => {
      // Remove relevant pieces of `touched` and `errors` too!
      let result: any;
      updateArrayField(
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
  );

  const handlePop = useEventCallback<ArrayHelpers<Values, Path>['handlePop']>(
    () => () => pop()
  );

  /**
   * Memoize for stability
   */
  return [
    fieldMeta,
    React.useMemo(
      () => ({
        push,
        handlePush,
        swap,
        handleSwap,
        move,
        handleMove,
        insert,
        handleInsert,
        replace,
        handleReplace,
        unshift,
        handleUnshift,
        handleRemove,
        handlePop,
        remove,
        pop,
      }),
      [
        handleInsert,
        handleMove,
        handlePop,
        handlePush,
        handleRemove,
        handleReplace,
        handleSwap,
        handleUnshift,
        insert,
        move,
        pop,
        push,
        remove,
        replace,
        swap,
        unshift,
      ]
    ),
    formik,
  ];
};

export type FieldArrayRenderProps<Values, Path extends string> =
  ArrayHelpers<Values, Path> & {
    form: FormikApi<Values>;
    field: FieldMetaProps<FieldArrayValue<Values, Path>>;
    name: FieldArrayName<Values, Path>;
  };

export type FieldArrayProps<Values, Path extends string> =
  UseFieldArrayProps<Values, Path> & {
    /**
     * Field component to render. Can either be a string like 'select' or a component.
     */
    component?: React.ComponentType<FieldArrayRenderProps<Values, Path>>;

    /**
      * Render prop (works like React router's <Route render={props =>} />)
      */
    render?: (props: FieldArrayRenderProps<Values, Path>) => React.ReactElement | null;

    /**
      * Children render function <Field name>{props => ...}</Field>)
      */
    children?: (props: FieldArrayRenderProps<Values, Path>) => React.ReactElement | null;
  };

export const FieldArray = <Values extends FormikValues = any, Path extends string = any>(
  rawProps: FieldArrayProps<Values, Path>
) => {
  const {
    component,
    render,
    children,
    validateOnChange = true,
    ...rest
  } = rawProps;
  const props = {
    validateOnChange,
    ...rest,
  };

  const [field, arrayHelpers, formikApi] = useFieldArray<Values, Path>(props);
  const { validateForm } = formikApi;
  const { validateOnChange: apiValidateOnChange } = useFormikConfig();

  /**
   * Should this go here?! Probably not. We should accept a validate fn and push it all the way to useField.
   */
  React.useEffect(() => {
    if (props.validateOnChange && apiValidateOnChange) {
      validateForm();
    }
  }, [props.validateOnChange, field.value, apiValidateOnChange, validateForm]);

  const renderProps: FieldArrayRenderProps<Values, Path> = React.useMemo(
    () => ({
      ...arrayHelpers,
      form: formikApi,
      field: field,
      name: props.name,
    }),
    [arrayHelpers, field, formikApi, props.name]
  );

  return component
    ? React.createElement(component, renderProps)
    : render
    ? render(renderProps) ?? null
    : children // children come last, always called
    ? typeof children === 'function'
      ? children(renderProps) ?? null
      : !isEmptyChildren(children)
      ? React.Children.only(children)
      : null
    : null;
};