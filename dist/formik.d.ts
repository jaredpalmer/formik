import * as React from 'react';
import {
  FormikActions,
  FormikConfig,
  FormikErrors,
  FormikState,
  FormikTouched,
  FormikValues,
  FormikContext,
} from './types';
export declare class Formik<
  Values = {},
  ExtraProps = {}
> extends React.Component<FormikConfig<Values> & ExtraProps, FormikState<any>> {
  static defaultProps: {
    validateOnChange: boolean;
    validateOnBlur: boolean;
    isInitialValid: boolean;
    enableReinitialize: boolean;
  };
  initialValues: Values;
  didMount: boolean;
  hcCache: {
    [key: string]: (e: string | React.ChangeEvent<any>) => void;
  };
  hbCache: {
    [key: string]: (e: any) => void;
  };
  fields: {
    [field: string]: {
      validate?: ((value: any) => string | Promise<void> | undefined);
    };
  };
  constructor(props: FormikConfig<Values> & ExtraProps);
  registerField: (
    name: string,
    fns: {
      reset?: ((nextValues?: any) => void) | undefined;
      validate?:
        | ((value: any) => string | Promise<void> | undefined)
        | undefined;
    }
  ) => void;
  unregisterField: (name: string) => void;
  componentDidMount(): void;
  componentWillUnmount(): void;
  componentDidUpdate(
    prevProps: Readonly<FormikConfig<Values> & ExtraProps>
  ): void;
  setErrors: (errors: FormikErrors<Values>) => void;
  setTouched: (touched: FormikTouched<Values>) => void;
  setValues: (values: FormikValues) => void;
  setStatus: (status?: any) => void;
  setError: (error: any) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  validateField: (field: string) => void;
  runSingleFieldLevelValidation: (
    field: string,
    value: string | void
  ) => Promise<string>;
  runFieldLevelValidations(values: FormikValues): Promise<FormikErrors<Values>>;
  runValidateHandler(values: FormikValues): Promise<FormikErrors<Values>>;
  runValidationSchema: (values: FormikValues) => Promise<{}>;
  runValidations: (values?: FormikValues) => Promise<FormikErrors<Values>>;
  handleChange: (
    eventOrPath: string | React.ChangeEvent<any>
  ) => void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void);
  setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement> | undefined) => void;
  submitForm: () => Promise<void>;
  executeSubmit: () => void;
  handleBlur: (eventOrString: any) => void | ((e: any) => void);
  setFieldTouched: (
    field: string,
    touched?: boolean,
    shouldValidate?: boolean
  ) => void;
  setFieldError: (field: string, message: string | undefined) => void;
  resetForm: (nextValues?: Values | undefined) => void;
  handleReset: () => void;
  setFormikState: (s: any, callback?: (() => void) | undefined) => void;
  getFormikActions: () => FormikActions<Values>;
  getFormikComputedProps: () => {
    dirty: boolean;
    isValid: boolean;
    initialValues: Values;
  };
  getFormikBag: () => {
    registerField: (
      name: string,
      fns: {
        reset?: ((nextValues?: any) => void) | undefined;
        validate?:
          | ((value: any) => string | Promise<void> | undefined)
          | undefined;
      }
    ) => void;
    unregisterField: (name: string) => void;
    handleBlur: (eventOrString: any) => void | ((e: any) => void);
    handleChange: (
      eventOrPath: string | React.ChangeEvent<any>
    ) => void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void);
    handleReset: () => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement> | undefined) => void;
    validateOnChange: (FormikConfig<Values> & ExtraProps)['validateOnChange'];
    validateOnBlur: (FormikConfig<Values> & ExtraProps)['validateOnBlur'];
    dirty: boolean;
    isValid: boolean;
    initialValues: Values;
    setStatus(status?: any): void;
    setError(e: any): void;
    setErrors(errors: FormikErrors<Values>): void;
    setSubmitting(isSubmitting: boolean): void;
    setTouched(touched: FormikTouched<Values>): void;
    setValues(values: Values): void;
    setFieldValue(
      field: keyof Values & string,
      value: any,
      shouldValidate?: boolean | undefined
    ): void;
    setFieldValue(field: string, value: any): void;
    setFieldError(field: keyof Values & string, message: string): void;
    setFieldError(field: string, message: string): void;
    setFieldTouched(
      field: keyof Values & string,
      isTouched?: boolean | undefined,
      shouldValidate?: boolean | undefined
    ): void;
    setFieldTouched(field: string, isTouched?: boolean | undefined): void;
    validateForm(values?: any): void;
    validateField(field: string): void;
    resetForm(nextValues?: any): void;
    submitForm(): void;
    setFormikState<
      K extends
        | 'error'
        | 'values'
        | 'errors'
        | 'touched'
        | 'isValidating'
        | 'isSubmitting'
        | 'status'
        | 'submitCount'
    >(
      f: (
        prevState: Readonly<FormikState<Values>>,
        props: any
      ) => Pick<FormikState<Values>, K>,
      callback?: (() => any) | undefined
    ): void;
    setFormikState<
      K extends
        | 'error'
        | 'values'
        | 'errors'
        | 'touched'
        | 'isValidating'
        | 'isSubmitting'
        | 'status'
        | 'submitCount'
    >(
      state: Pick<FormikState<Values>, K>,
      callback?: (() => any) | undefined
    ): void;
    values: any;
    error?: any;
    errors: FormikErrors<any>;
    touched: FormikTouched<any>;
    isValidating: boolean;
    isSubmitting: boolean;
    status?: any;
    submitCount: number;
  };
  getFormikContext: () => FormikContext<any>;
  render(): JSX.Element;
}
export declare function yupToFormErrors<Values>(
  yupError: any
): FormikErrors<Values>;
export declare function validateYupSchema<T extends FormikValues>(
  values: T,
  schema: any,
  sync?: boolean,
  context?: any
): Promise<Partial<T>>;
