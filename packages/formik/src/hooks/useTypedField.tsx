import * as React from "react";
import { FieldAttributes, TypedField } from '../types';
import { Field } from "../Field";

export const useTypedField = <Values,>() => React.useMemo<TypedField<Values>>(
    () => <Path extends string>(
      props: FieldAttributes<Values, Path, any>
    ) => 
      <Field<Values, Path, any> {...props} />, 
    []
);
