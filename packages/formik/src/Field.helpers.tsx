import * as React from "react";
import { Field } from "./Field";
import {
  CustomField,
  FieldByValue,
  TypedField
} from "./Field.types";

/**
 * Create a Field<Value, Values> from a CustomField<Value>.
 */
export const createCustomField = <Values,>() => <Value,>(
  FieldType: CustomField<Value>
): FieldByValue<Value, Values> =>
  (props) => <FieldType<Values> {...props} />;

/**
 * Use a CustomField<Value> as Field<Value, Values>.
 */
export const useCustomField = <Values,>() => <Value,>(
  FieldType: CustomField<Value>
) => React.useMemo(
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
) => React.useMemo(
  () => createTypedField<Values>(FieldType),
  []
);
