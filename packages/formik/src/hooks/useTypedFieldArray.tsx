import * as React from "react";
import { FieldArray, FieldArrayProps } from "../FieldArray";

export type TypedFieldArray<FormValues> = <Path extends string>(
  props: FieldArrayProps<FormValues, Path>
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
