import * as React from "react";
import { FieldArray, FieldArrayConfig } from "../FieldArray";

export type TypedFieldArray<Values> = <Value>(
  props: FieldArrayConfig<Values, Value>
) =>
  React.ReactElement | null;

/**
 * Get TypedFieldArray from anywhere.
 */
export const createTypedFieldArray = <Values,>(): TypedFieldArray<Values> =>
  (props) => <FieldArray {...props} />;

/**
 * Use TypedFieldArray from within a component.
 */
export const useTypedFieldArray = <Values,>() =>
  React.useMemo<TypedFieldArray<Values>>(
    () => createTypedFieldArray(),
    []
  );
