import * as React from "react";
import { Field, FieldConfig } from "../Field";

export type TypedField<FormValues> = <
  Path extends string,
  ExtraProps
>(
  props: FieldConfig<FormValues, Path, ExtraProps>
) =>
  React.ReactElement | null;

export const useTypedField = <Values,>() => React.useMemo<TypedField<Values>>(
    () => (
      props
    ) =>
      <Field {...props} />,
    []
);
