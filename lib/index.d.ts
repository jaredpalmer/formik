import * as React from 'react';
/**
 * Transform Yup ValidationError to a more usable object
 */
export declare function yupToFormErrors(yupError: any): FormikErrors;
/**
 * Given an object, map keys to boolean
 */
export declare function touchAllFields<T>(fields: T): {
    [field: string]: boolean;
};
/**
 * Validate a yup schema.
 */
export declare function validateFormData<T>(data: T, schema: any): Promise<void>;
export interface FormikValues {
    [field: string]: any;
}
export interface FormikErrors {
    [field: string]: string;
}
export interface FormikTouched {
    [field: string]: boolean;
}
/**
 * Formik configuration options
 */
export interface FormikConfig<Props, Values, Payload> {
    displayName?: string;
    mapPropsToValues?: (props: Props) => Values;
    mapValuesToPayload?: (values: Values) => Payload;
    validationSchema: any;
    handleSubmit: (payload: Payload, formikBag: FormikBag<Props, Values>) => void;
}
/**
 * Formik state tree
 */
export interface FormikState<V> {
    values: V;
    error?: any;
    /** map of field names to specific error for that field */
    errors: FormikErrors;
    /** map of field names to whether the field has been touched */
    touched: FormikTouched;
    /** whether the form is currently submitting */
    isSubmitting: boolean;
}
/**
 * Formik state helpers
 */
export interface FormikActions<P, V> {
    setError: (e: any) => void;
    setErrors: (errors: FormikErrors) => void;
    setSubmitting: (isSubmitting: boolean) => void;
    setTouched: (touched: FormikTouched) => void;
    setValues: (values: V) => void;
    resetForm: (nextProps?: P) => void;
}
/**
 * Formik form event handlers
 */
export interface FormikHandlers {
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleChange: (e: React.ChangeEvent<any>) => void;
    handleBlur: (e: any) => void;
    handleChangeValue: (name: string, value: any) => void;
    handleReset: () => void;
}
/**
 * State, handlers, and helpers injected as props into the wrapped form component.
 */
export declare type InjectedFormikProps<Props, Values> = Props & FormikState<Values> & FormikActions<Props, Values> & FormikHandlers;
/**
 * Formik actions + { props }
 */
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
export declare function Formik<Props, Values extends FormikValues, Payload>({displayName, mapPropsToValues, mapValuesToPayload, validationSchema, handleSubmit}: FormikConfig<Props, Values, Payload>): ComponentDecorator<Props, InjectedFormikProps<Props, Values>>;
