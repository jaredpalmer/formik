import * as React from "react";
import { FieldArray } from "./FieldArray";
import { TypedFieldArray } from "./FieldArray.types";

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
