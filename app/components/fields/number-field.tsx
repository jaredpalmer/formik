import { formatNumberOrEmpty, parseNumberOrEmpty } from "app/helpers/parse-format-helpers";
import {
    CustomField,
    FieldConfigByValue,
    useTypedFieldByValue
} from "formik";
import React from "react";
import { NumberAsField } from "./number-as-field";

export const NumberField: CustomField<number | ""> = <Values,>(
    props: FieldConfigByValue<
        Values,
        number | ""
    >
) => {
    const TypedField = useTypedFieldByValue<Values, number | "">();

    return <TypedField
        type="text"
        name={props.name}
        format={formatNumberOrEmpty}
        parse={parseNumberOrEmpty}
        as={NumberAsField}
    />
};
