import {
    FieldAsProps,
    FormatFn,
    ParseFn,
    PathMatchingValue,
    useFormikContext
} from "formik";

const parseNumberOrEmpty = (value: unknown) => value === "" ? "" : Number(value);
const formatNumberOrEmpty = (value: number | '') =>
    Number(value) ? value.toLocaleString() : "";

export const NumberField = <
    Values,
    Path extends PathMatchingValue<Values, number | "">
>(props: FieldAsProps<
    number | "",
    Values,
    Path,
    {
        hidden: boolean,
        id: string,
        placeholder?: string,
    }
>) => {
    const formik = useFormikContext<Values>();
    const parse: ParseFn<number | ""> = props.parse ?? parseNumberOrEmpty;
    const format: FormatFn<number | ""> = props.format ?? formatNumberOrEmpty;

    const handleChange = (value: unknown) => {
        formik.setFieldValue(props.name, parse(value, props.name));
    }

    return <input
        type={props.hidden
            ? "hidden"
            : props.type
        }
        name={props.name}
        value={format(props.value, props.name)}
        onChange={handleChange}
        onBlur={formik.handleBlur}
        placeholder={props.placeholder}
    />
};
