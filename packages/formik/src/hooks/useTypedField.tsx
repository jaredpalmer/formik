import * as React from "react";
import { Field, FieldConfig } from "../Field";

export type TypedField<Values> = <Value>(
  props: FieldConfig<Value, Values>
) =>
  React.ReactElement | null;

export type CustomField<Value> = <
  Values,
>(
  props: FieldConfig<Value, Values>
) =>
  React.ReactElement | null;

export type FieldByValue<Value, Values> = (
  props: FieldConfig<Value, Values>
) =>
  React.ReactElement | null;

/**
 * Create a ResolvedField which maps a custom Field type to Values.
 */
export const createCustomField = <Values,>() => <Value,>(
  FieldType: CustomField<Value>
): FieldByValue<Value, Values> =>
  (props) => <FieldType<Values> {...props} />;

/**
 * Create a ResolvedField which maps a custom Field type to Values.
 *
 * @private
 */
export const useCustomField = <Values,>() => <Value,>(
  FieldType: CustomField<Value>
) => React.useMemo<FieldByValue<Value, Values>>(
  () => createCustomField<Values>()(FieldType),
  [FieldType]
);

/**
 * Create a typed field from anywhere.
 */
export const createTypedField = <Values,>(
  FieldType: TypedField<Values> = Field
): TypedField<Values> => FieldType;

/**
 * Create a TypedField from within Formik.
 *
 * @private
 */
export const useTypedField = <Values,>(
  FieldType: TypedField<Values> = Field
) => React.useMemo<TypedField<Values>>(
  () => createTypedField<Values>(FieldType),
  []
);
