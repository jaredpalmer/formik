import * as React from 'react';
export interface FormikValues {
  [field: string]: any;
}
export declare type FormikErrors<Values> = {
  [K in keyof Values]?: Values[K] extends object
    ? FormikErrors<Values[K]>
    : string
};
export declare type FormikTouched<Values> = {
  [K in keyof Values]?: Values[K] extends object
    ? FormikTouched<Values[K]>
    : boolean
};
export interface FormikState<Values> {
  values: Values;
  error?: any;
  errors: FormikErrors<Values>;
  touched: FormikTouched<Values>;
  isValidating: boolean;
  isSubmitting: boolean;
  status?: any;
  submitCount: number;
}
export interface FormikComputedProps<Values> {
  readonly dirty: boolean;
  readonly isValid: boolean;
  readonly initialValues: Values;
}
export interface FormikActions<Values> {
  setStatus(status?: any): void;
  setError(e: any): void;
  setErrors(errors: FormikErrors<Values>): void;
  setSubmitting(isSubmitting: boolean): void;
  setTouched(touched: FormikTouched<Values>): void;
  setValues(values: Values): void;
  setFieldValue(
    field: keyof Values & string,
    value: any,
    shouldValidate?: boolean
  ): void;
  setFieldError(field: keyof Values & string, message: string): void;
  setFieldTouched(
    field: keyof Values & string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ): void;
  validateForm(values?: any): void;
  validateField(field: string): void;
  resetForm(nextValues?: any): void;
  submitForm(): void;
  setFormikState<K extends keyof FormikState<Values>>(
    f: (
      prevState: Readonly<FormikState<Values>>,
      props: any
    ) => Pick<FormikState<Values>, K>,
    callback?: () => any
  ): void;
}
export interface FormikActions<Values> {
  setFieldValue(field: string, value: any): void;
  setFieldError(field: string, message: string): void;
  setFieldTouched(field: string, isTouched?: boolean): void;
  setFormikState<K extends keyof FormikState<Values>>(
    state: Pick<FormikState<Values>, K>,
    callback?: () => any
  ): void;
}
export interface FormikHandlers {
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  handleReset: () => void;
  handleBlur(e: any): void;
  handleBlur<T = string | any>(
    fieldOrEvent: T
  ): T extends string ? ((e: any) => void) : void;
  handleChange(e: React.ChangeEvent<any>): void;
  handleChange<T = string | React.ChangeEvent<any>>(
    field: T
  ): T extends React.ChangeEvent<any>
    ? void
    : ((e: string | React.ChangeEvent<any>) => void);
}
export interface FormikSharedConfig {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  isInitialValid?: boolean | ((props: object) => boolean | undefined);
  enableReinitialize?: boolean;
}
export interface FormikConfig<Values> extends FormikSharedConfig {
  initialValues: Values;
  onReset?: (values: Values, formikActions: FormikActions<Values>) => void;
  onSubmit: (values: Values, formikActions: FormikActions<Values>) => void;
  component?: React.ComponentType<FormikProps<Values>> | React.ReactNode;
  render?: ((props: FormikProps<Values>) => React.ReactNode);
  validationSchema?: any | (() => any);
  validate?: ((
    values: Values
  ) => void | object | Promise<FormikErrors<Values>>);
  children?:
    | ((props: FormikProps<Values>) => React.ReactNode)
    | React.ReactNode;
}
export declare type FormikProps<Values> = FormikSharedConfig &
  FormikState<Values> &
  FormikActions<Values> &
  FormikHandlers &
  FormikComputedProps<Values> &
  FormikRegistration;
export interface FormikRegistration {
  registerField(
    name: string,
    fns: {
      validate?: ((
        value: any
      ) => string | Function | Promise<void> | undefined);
    }
  ): void;
  unregisterField(name: string): void;
}
export declare type FormikContext<Values> = FormikProps<Values> &
  Pick<FormikConfig<Values>, 'validate' | 'validationSchema'>;
export interface SharedRenderProps<T> {
  component?: string | React.ComponentType<T | void>;
  render?: ((props: T) => React.ReactNode);
  children?: ((props: T) => React.ReactNode);
}
export declare type GenericFieldHTMLAttributes =
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.SelectHTMLAttributes<HTMLSelectElement>
  | React.TextareaHTMLAttributes<HTMLTextAreaElement>;
