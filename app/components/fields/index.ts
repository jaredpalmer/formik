import { NumberField } from 'app/components/fields/number-field';
import {
    createCustomField,
    createTypedField,
    createTypedFieldArray
} from 'formik';
import { useMemo } from 'react';

export const createTypedFields = <Values,>() => ({
    Field: createTypedField<Values>(),
    FieldArray: createTypedFieldArray<Values>(),
    NumberField: createCustomField<Values>()(NumberField),
});

export const useTypedFields = <Values,>() =>
    useMemo(() => createTypedFields<Values>(), []);
