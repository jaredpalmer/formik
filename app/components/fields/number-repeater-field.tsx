import {
    Field,
    FieldArrayProps,
} from "formik";
import React from "react";
import { NumberAsField } from "./number-as-field";

export const NumberRepeaterField = <
    Values,
>(props: FieldArrayProps<
    number | "",
    Values
>) => {
    return <div>
        {props.field.value?.length > 0
            ? props.field.value.map((_value, index) => (
                <div key={index}>
                    <Field
                        name={`${props.name}.${index}`}
                        as={NumberAsField}
                        type="number"
                    />
                    <button
                    type="button"
                    // remove a friend from the list
                    onClick={() => props.remove(index)}
                    >
                    -
                    </button>
                    <button
                    type="button"
                    // insert an empty string at a position
                    onClick={() => props.insert(index, '')}
                    >
                    +
                    </button>
                </div>
            ))
            :
                // show this when user has removed all friends from the list
                <button type="button" onClick={() => props.push('')}>
                Add a friend
                </button>
        }
    </div>
};