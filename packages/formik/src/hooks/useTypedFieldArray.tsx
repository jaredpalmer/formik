import * as React from "react";
import { FieldArray, FieldArrayProps } from "../FieldArray";
import { NameOf } from "../types";

export type TypedFieldArray<Values> = <Path extends NameOf<Values>>(
  props: FieldArrayProps<Values, Path>
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
