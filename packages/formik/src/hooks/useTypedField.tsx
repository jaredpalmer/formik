import * as React from "react";
import { Field, FieldAsComponent, FieldConfigByPath, FieldConfigByValue, TypedAsField } from "../Field";
import { PathOf } from "../types";

export type TypedFieldByPath<Values> = <Path extends PathOf<Values>>(
  props: FieldConfigByPath<Values, Path>
) =>
  React.ReactElement | null;

export type TypedFieldByValue<Values> = <Value>(
  props: FieldConfigByValue<Values, Value>
) =>
  React.ReactElement | null;

export type CustomField<Value> = <
  Values,
>(
  props: FieldConfigByValue<Values, Value>
) =>
  React.ReactElement | null;

export type FieldByValue<Values, Value> = (
  props: FieldConfigByValue<Values, Value>
) =>
  React.ReactElement | null;

/**
 * Create a ResolvedField which maps a custom Field type to Values.
 */
export const createCustomField = <Values,>() => <Value,>(
  FieldType: CustomField<Value>
): FieldByValue<Values, Value> =>
  (props) => <FieldType<Values> {...props} />;

/**
 * Create a ResolvedField which maps a custom Field type to Values.
 */
export const createAsField = <Values,>() => <Value,>(
  FieldType: TypedAsField<Value>
): FieldAsComponent<Values, Value> => (props) => <FieldType<Values> {...props} />;

/**
 * Create a ResolvedField which maps a custom Field type to Values.
 *
 * @private
 */
export const useCustomField = <Values,>() => <Value,>(
  FieldType: CustomField<Value>
) => React.useMemo<FieldByValue<Values, Value>>(
  () => createCustomField<Values>()(FieldType),
  [FieldType]
);

/**
 * Create a typed field from anywhere.
 */
export const createTypedField = <Values,>(
  FieldType: TypedFieldByPath<Values> = Field
): TypedFieldByPath<Values> => FieldType;

/**
 * Create a TypedField from within Formik.
 *
 * @private
 */
export const useTypedField = <Values,>(
  FieldType: TypedFieldByPath<Values> = Field
) => React.useMemo<TypedFieldByPath<Values>>(
  () => createTypedField<Values>(FieldType),
  []
);

/**
 * Create a typed field from anywhere.
 */
export const createTypedFieldByValue = <Values, Value>(
  FieldType: TypedFieldByValue<Values> = Field
): FieldByValue<Values, Value> => FieldType;

/**
 * Create a TypedField from within Formik.
 *
 * @private
 */
export const useTypedFieldByValue = <Values, Value>(
  FieldType: TypedFieldByValue<Values> = Field
) =>
  React.useMemo<FieldByValue<Values, Value>>(
    () => createTypedFieldByValue<Values, Value>(FieldType),
    []
  );
