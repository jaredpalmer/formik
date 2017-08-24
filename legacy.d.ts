/// <reference types="react" />
import * as React from 'react';
export interface FormikValues {
    [field: string]: any;
}
export declare type FormikErrors<Values extends FormikValues> = {
    [Key in keyof Values]?: string;
};
export declare type FormikTouched<Values extends FormikValues> = {
    [Key in keyof Values]?: boolean;
};
export interface FormikConfig<Props, Values extends FormikValues, DeprecatedPayload = Values> {
    displayName?: string;
    mapPropsToValues?: (props: Props) => Values;
    mapValuesToPayload?: (values: Values) => DeprecatedPayload;
    validate?: (values: Values, props: Props) => void | FormikErrors<Values> | Promise<any>;
    validationSchema?: ((props: Props) => any) | any;
    handleSubmit: (values: Values | DeprecatedPayload, formikBag: FormikBag<Props, Values>) => void;
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    isInitialValid?: boolean | ((props: Props) => boolean | undefined);
}
export interface FormikState<Values> {
    values: Values;
    error?: any;
    errors: FormikErrors<Values>;
    touched: FormikTouched<Values>;
    isSubmitting: boolean;
    status?: any;
}
export interface FormikComputedProps {
    readonly dirty: boolean;
    readonly isValid: boolean;
}
export interface FormikActions<Props, Values> {
    setStatus: (status?: any) => void;
    setError: (e: any) => void;
    setErrors: (errors: FormikErrors<Values>) => void;
    setSubmitting: (isSubmitting: boolean) => void;
    setTouched: (touched: FormikTouched<Values>) => void;
    setValues: (values: Values) => void;
    setFieldValue: (field: keyof Values, value: any) => void;
    setFieldError: (field: keyof Values, message: string) => void;
    setFieldTouched: (field: keyof Values, isTouched?: boolean) => void;
    resetForm: (nextProps?: Props) => void;
    submitForm: () => void;
}
export interface FormikHandlers {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleChange: (e: React.ChangeEvent<any>) => void;
    handleBlur: (e: any) => void;
    handleChangeValue: (name: string, value: any) => void;
    handleReset: () => void;
}
export declare type InjectedFormikProps<Props, Values> = Props & FormikState<Values> & FormikActions<Props, Values> & FormikHandlers & FormikComputedProps;
export declare type FormikBag<P, V> = {
    props: P;
} & FormikActions<P, V>;
export declare type CompositeComponent<P> = React.ComponentClass<P> | React.StatelessComponent<P>;
export interface ComponentDecorator<TOwnProps, TMergedProps> {
    (component: CompositeComponent<TMergedProps>): React.ComponentClass<TOwnProps>;
}
export interface InferableComponentDecorator<TOwnProps> {
    <T extends CompositeComponent<TOwnProps>>(component: T): T;
}
export declare function Formik<Props, Values extends FormikValues, Payload = Values>({displayName, mapPropsToValues, mapValuesToPayload, validate, validationSchema, handleSubmit, validateOnChange, validateOnBlur, isInitialValid}: FormikConfig<Props, Values, Payload>): ComponentDecorator<Props, InjectedFormikProps<Props, Values>>;
export declare function yupToFormErrors<Values>(yupError: any): FormikErrors<Values>;
export declare function validateYupSchema<T>(data: T, schema: any): Promise<void>;
export declare function touchAllFields<T>(fields: T): FormikTouched<T>;
