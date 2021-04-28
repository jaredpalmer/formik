import { NumberAsField } from './number-as-field';
import { NumberField } from 'app/components/fields/number-field';
import { createCustomField, createTypedField, createAsField } from './../../../packages/formik/src/hooks/useTypedField';
import { useMemo } from 'react';

export const createTypedFields = <Values,>() => ({
    Field: createTypedField<Values>(),
    NumberField: createCustomField<Values>()(NumberField),
    NumberAsField: createAsField<Values>()(NumberAsField)
});

export const useTypedFields = <Values,>() =>
    useMemo(() => createTypedFields<Values>(), []);
