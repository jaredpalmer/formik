import { formatNumberOrEmpty, parseNumberOrEmpty } from "app/helpers/parse-format-helpers";
import {
    CustomField,
    FieldConfig,
} from "formik";
import React from "react";
import { useTypedFields } from ".";
import { NumberAsField } from "./number-as-field";

export const NumberField: CustomField<number | ""> = <Values,>(
    props: FieldConfig<
        number | "",
        Values
    >
) => {
    const fields = useTypedFields<Values>();

    return <fields.Field
        type="text"
        name={props.name}
        format={(formatNumberOrEmpty)}
        parse={parseNumberOrEmpty}
        as={NumberAsField}
    />
};
