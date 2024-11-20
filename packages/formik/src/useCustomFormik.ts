import { useFormik } from './Formik';

import type {
  FormikConfig,
  FormikValues,
  FieldInputProps,
} from './types';
import { FieldConfig } from './Field';

type FieldValues = Record<string, any>;

type Primitive = null | undefined | string | number | boolean | symbol | bigint;

type IsTuple<T extends ReadonlyArray<any>> = number extends T['length']
  ? false
  : true;
type TupleKey<T extends ReadonlyArray<any>> = Exclude<keyof T, keyof any[]>;
type ArrayKey = number;

type PathImpl<K extends string | number, V> = V extends Primitive
  ? `${K}`
  : `${K}` | `${K}.${Path<V>}`;

type Path<T> =
  T extends ReadonlyArray<infer V>
    ? IsTuple<T> extends true
      ? {
          [K in TupleKey<T>]-?: PathImpl<K & string, T[K]>;
        }[TupleKey<T>]
      : PathImpl<ArrayKey, V>
    : {
        [K in keyof T]-?: PathImpl<K & string, T[K]>;
      }[keyof T];

type TDeepKeyof<TFieldValues extends FieldValues> = Path<TFieldValues>;
export const useCustomFormik = <T extends FormikValues>({
  validateOnChange,
  validateOnBlur,
  validateOnMount,
  isInitialValid,
  enableReinitialize,
  onSubmit,
  validationSchema,
  initialValues,
  children,
  component,
  initialErrors,
  initialStatus,
  initialTouched,
  innerRef,
  onReset,
  validate,
}: FormikConfig<T>) => {
  const {
    getFieldProps: noTypeGetFieldProps,
    setFieldTouched: noTypeSetFieldTouched,
    setFieldValue: noTypeSetFieldValue,
    setFieldError: noTypeSetFieldError,
    getFieldMeta: noTypeGetFieldMeta,
    getFieldHelpers: noTypeGetFieldHelpers,
    ...rest
  } = useFormik<T>({
    validateOnChange,
    validateOnMount,
    isInitialValid,
    enableReinitialize,
    onSubmit,
    validationSchema,
    validateOnBlur,
    initialValues,
    children,
    component,
    initialErrors,
    initialStatus,
    initialTouched,
    innerRef,
    onReset,
    validate,
  });
  const getFieldProps = (
    nameOrOptions: TDeepKeyof<T> | FieldConfig<TDeepKeyof<T>>,
  ): FieldInputProps<TDeepKeyof<T>> => {
    return noTypeGetFieldProps(
      nameOrOptions! satisfies TDeepKeyof<T> | FieldConfig<TDeepKeyof<T>>,
    );
  };
  const setFieldTouched = (
    field: TDeepKeyof<T>,
    touched?: boolean | undefined,
    shouldValidate?: boolean | undefined,
  ) => {
    return noTypeSetFieldTouched(
      field! satisfies TDeepKeyof<T>,
      touched,
      shouldValidate,
    );
  };
  const setFieldValue = (
    field: TDeepKeyof<T>,
    value?: any,
    shouldValidate?: any,
  ) => {
    noTypeSetFieldValue(field! satisfies TDeepKeyof<T>, value, shouldValidate);
  };
  const setFieldError = (field: TDeepKeyof<T>, value: string | undefined) => {
    noTypeSetFieldError(field! satisfies TDeepKeyof<T>, value);
  };
  const getFieldMeta = (name: TDeepKeyof<T>) => {
    noTypeGetFieldMeta(name! satisfies TDeepKeyof<T>);
  };
  const getFieldHelpers = (name: TDeepKeyof<T>) => {
    noTypeGetFieldHelpers(name! satisfies TDeepKeyof<T>);
  };
  return {
    ...rest,
    getFieldProps,
    setFieldTouched,
    setFieldValue,
    setFieldError,
    getFieldMeta,
    getFieldHelpers,
  };
};
