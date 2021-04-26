import { parseNumberOrEmpty, formatNumberOrEmpty } from "app/helpers/parse-format-helpers";
import {
    FieldAsProps,
    FormatFn,
    ParseFn,
    TypedAsField,
    useFormikContext
} from "formik";
import React from "react";

export const NumberAsField: TypedAsField<number | ""> = <
    Values,
>(props: FieldAsProps<number | "", Values>) => {
    const formik = useFormikContext<Values>();
    const parse: ParseFn<number | ""> = props.parse ?? parseNumberOrEmpty;
    const format: FormatFn<number | ""> = props.format ?? formatNumberOrEmpty;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parse(event.target.value, props.name);
        console.log(parsedValue);
        formik.setFieldValue(props.name, parsedValue);
    }

    return <input
        type="text"
        name={props.name}
        value={format(props.value, props.name)}
        onChange={handleChange}
        onBlur={formik.handleBlur}
        inputMode="numeric"
    />
};