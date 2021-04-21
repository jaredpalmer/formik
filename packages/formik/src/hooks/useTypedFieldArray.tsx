import * as React from "react";
import { FieldArray, FieldArrayProps } from "../FieldArray";

export type TypedFieldArray<FormValues> = <Path extends string>(
  props: FieldArrayProps<FormValues, Path>
) =>
  React.ReactElement | null;

export const useTypedFieldArray = <Values,>() =>
  React.useMemo<TypedFieldArray<Values>>(
    () => (
      props
    ) =>
      <FieldArray {...props} />,
    []
  );
