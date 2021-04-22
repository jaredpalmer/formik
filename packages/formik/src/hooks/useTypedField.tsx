import * as React from "react";
import { Field, FieldConfig } from "../Field";
import { NameOf } from "../types";

export type TypedField<Values> = <
  Path extends NameOf<Values>,
  ExtraProps = {}
>(
  props: FieldConfig<Values, Path, ExtraProps>
) =>
  React.ReactElement | null;

/**
 * Create a typed field from anywhere.
 */
export const createTypedField = <Values,>(): TypedField<Values> => (
  props
) =>
  <Field {...props} />;

/**
 * Create a TypedField from within Formik.
 *
 * @private
 */
export const useTypedField = <Values,>() => React.useMemo<TypedField<Values>>(
    () => createTypedField(),
    []
);
