import { formatNumberOrEmpty, parseNumberOrEmpty } from "app/helpers/parse-format-helpers";
import {
    CustomField,
    FieldConfig,
    useTypedField
} from "formik";
import React from "react";
import { NumberAsField } from "./number-as-field";

export const NumberField: CustomField<number | ""> = <Values,>(
    props: FieldConfig<
        number | "",
        Values
    >
) => {
    const TypedField = useTypedField<Values>();

    return <TypedField
        type="text"
        name={props.name}
        format={(formatNumberOrEmpty)}
        parse={parseNumberOrEmpty}
        as={NumberAsField}
    />
};
