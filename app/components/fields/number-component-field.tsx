import {
    ParseFn,
    TypedComponentField,
} from "formik";

const parseNumberOrEmpty = (value: unknown) => value === "" ? "" : Number(value);

export const NumberComponentField: TypedComponentField<number | "", {
    hidden: boolean,
    id: string,
    placeholder?: string,
}> = (props) => {
    const parse: ParseFn<number | ""> = props.parse ?? parseNumberOrEmpty;

    const handleChange = (value: unknown) => {
        props.form.setFieldValue(props.name, parse(value, props.name));
    }

    return <input
        {...props.field}
        id={props.id}
        type={props.hidden
            ? "hidden"
            : props.type
        }
        placeholder={props.placeholder}
        onChange={handleChange}
    />
};
