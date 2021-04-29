import * as React from "react";
import { FieldArray, FieldArrayConfig } from "../FieldArray";

export type TypedFieldArray<Values> = <Value>(
  props: FieldArrayConfig<Value, Values>
) =>
  React.ReactElement | null;

/**
 * Get TypedFieldArray from anywhere.
 */
export const createTypedFieldArray = <Values,>(): TypedFieldArray<Values> =>
  FieldArray;

/**
 * Use TypedFieldArray from within a component.
 */
export const useTypedFieldArray = <Values,>() =>
  React.useMemo<TypedFieldArray<Values>>(
    () => createTypedFieldArray(),
    []
  );
