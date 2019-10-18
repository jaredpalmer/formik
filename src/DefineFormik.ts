import { Formik } from './Formik';
import { useFormikContext } from './FormikContext';
import { Field, FieldAttributes, useField } from './Field';
import { FormikConfig, FormikValues } from './types';

export const defineFormik = <
  TValues extends FormikValues,
  TError = string
>() => ({
  Formik: <ExtraProps = {}>(
    props: FormikConfig<TValues, TError> & ExtraProps
  ) => Formik(props),
  useFormikContext: () => useFormikContext<TValues, TError>(),
  Field: <TFieldName extends keyof TValues & string, TAttributes = any>(
    props: FieldAttributes<TAttributes, TFieldName, TValues, TError>
  ) => Field(props),
  useField: <TFieldName extends keyof TValues & string, TAttributes = any>(
    propsOrFieldName:
      | TFieldName
      | FieldAttributes<TAttributes, TFieldName, TValues, TError>
  ) => useField(propsOrFieldName),
});
