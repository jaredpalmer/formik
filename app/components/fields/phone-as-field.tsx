import { parsePhoneOrEmpty } from "app/helpers/parse-format-helpers";
import {
    FieldAsProps,
    ParseFn,
    TypedAsField,
    useFormikContext
} from "formik";
import React from "react";

export const PhoneAsField: TypedAsField<string> = <
    Values,
>(props: FieldAsProps<Values, string>) => {
    const formik = useFormikContext<Values>();
    const parse: ParseFn<string> = props.parse ?? parsePhoneOrEmpty;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parse(event.target.value, props.name);
        console.log(parsedValue);
        formik.setFieldValue(props.name, parsedValue);
    }

    return <input
        type="text"
        name={props.name}
        value={props.format ? props.format(props.value, props.name) ? props.value}
        onChange={handleChange}
        onBlur={formik.handleBlur}
        inputMode="numeric"
    />
};