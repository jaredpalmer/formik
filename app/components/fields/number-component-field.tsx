import { parseNumberOrEmpty } from "app/helpers/parse-format-helpers";
import {
    ParseFn,
    TypedComponentField,
} from "formik";

export const NumberComponentField: TypedComponentField<number | ""> = (props) => {
    const parse: ParseFn<number | ""> = props.parse ?? parseNumberOrEmpty;

    const handleChange = (value: unknown) => {
        props.form.setFieldValue(props.name, parse(value, props.name));
    }

    return <input
        {...props.field}
        type="text"
        onChange={handleChange}
        inputMode="numeric"
    />
};
