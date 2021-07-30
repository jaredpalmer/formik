import * as React from 'react';
import cloneDeep from 'lodash/cloneDeep';
import { arraySwap, arrayMove, arrayInsert, arrayReplace, copyArrayLike } from './helpers/array-helpers';
import { useFormikConfig, useFormikContext } from './FormikContext';
import { FieldMetaProps, FormikApi, FormikReducerState, FormikValues } from './types';
import { useEventCallback } from './hooks/useEventCallback';
import { getIn, isEmptyArray, isEmptyChildren, isFunction, setIn } from './utils';
import { useFieldMeta } from './hooks/hooks';
import { ArrayHelpers, FieldArrayConfig, FieldArrayProps, UseFieldArrayConfig } from './FieldArray.types';

type UpdateFieldArrayFn<Value> = (
  array: Value[] | boolean[]
) => void;

export const useFieldArray = <
  Value extends any = any,
  Values extends FormikValues = any
>(
  props: UseFieldArrayConfig<Value, Values>
): [
  FieldMetaProps<Value[]>,
  ArrayHelpers<Value>,
  FormikApi<Values>
] => {
  const formik = useFormikContext<Values>();
  const { setFormikState } = formik;
  const fieldMeta = useFieldMeta<Value[]>(props.name);

  const updateArrayField = useEventCallback(
    (
      // eslint-disable-next-line @typescript-eslint/ban-types
      fn: UpdateFieldArrayFn<Value>,
      // eslint-disable-next-line @typescript-eslint/ban-types
      alterTouched: boolean | UpdateFieldArrayFn<Value>,
      // eslint-disable-next-line @typescript-eslint/ban-types
      alterErrors: boolean | UpdateFieldArrayFn<Value>
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

  const push = useEventCallback<ArrayHelpers<Value>['push']>(
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

  const handlePush = useEventCallback<ArrayHelpers<Value>['handlePush']>(
    (value) => () => push(value),
  );

  const swap = useEventCallback<ArrayHelpers<Value>['swap']>(
    (indexA, indexB) =>
      updateArrayField(
        (array: any[]) => arraySwap(array, indexA, indexB),
        true,
        true
      )
  );

  const handleSwap = useEventCallback<ArrayHelpers<Value>['handleSwap']>(
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

  const handleMove = useEventCallback<ArrayHelpers<Value>['handleMove']>(
    (from: number, to: number) => () => move(from, to)
  );

  const insert = useEventCallback<ArrayHelpers<Value>['insert']>(
    (index: number, value: any) =>
      updateArrayField(
        (array: any[]) => arrayInsert(array, index, value),
        (array: any[]) => arrayInsert(array, index, null),
        (array: any[]) => arrayInsert(array, index, null)
      )
  );

  const handleInsert = useEventCallback<ArrayHelpers<Value>['handleInsert']>(
    (index: number, value: any) => () => insert(index, value)
  );

  const replace = useEventCallback<ArrayHelpers<Value>['replace']>(
    (index: number, value: any) =>
      updateArrayField(
        (array: any[]) => arrayReplace(array, index, value),
        false,
        false
      )
  );

  const handleReplace = useEventCallback<ArrayHelpers<Value>['handleReplace']>(
    (index: number, value: any) => () => replace(index, value)
  );

  const unshift = useEventCallback<ArrayHelpers<Value>['unshift']>(
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

  const handleUnshift = useEventCallback<ArrayHelpers<Value>['handleUnshift']>(
    (value: any) => () => unshift(value)
  );

  const remove = useEventCallback<ArrayHelpers<Value>['remove']>(
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

  const handleRemove = useEventCallback<ArrayHelpers<Value>['handleRemove']>(
    (index: number) => () => remove(index)
  );

  const pop = useEventCallback<ArrayHelpers<Value>['pop']>(
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

  const handlePop = useEventCallback<ArrayHelpers<Value>['handlePop']>(
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

export const FieldArray = <
  Value extends any = any,
  Values extends FormikValues = any
>(
  rawProps: FieldArrayConfig<Value, Values>
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

  const [field, arrayHelpers, formikApi] = useFieldArray(props);
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

  const renderProps: FieldArrayProps<Value, Values> = React.useMemo(
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