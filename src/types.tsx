import * as React from 'react';
/**
 * Values of fields in the form
 */
export interface FormikValues {
  [field: string]: any;
}

/**
 * An object containing error messages whose keys correspond to FormikValues.
 * Should be always be and object of strings, but any is allowed to support i18n libraries.
 */
export type FormikErrors<TValues, TError = string> = {
  [K in keyof TValues]?: TValues[K] extends any[]
    ? TValues[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikErrors<TValues[K][number], TError>[] | TError | TError[]
      : TError | TError[]
    : TValues[K] extends object
    ? FormikErrors<TValues[K], TError>
    : TError;
};

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 */
export type FormikTouched<TValues> = {
  [K in keyof TValues]?: TValues[K] extends any[]
    ? TValues[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikTouched<TValues[K][number]>[]
      : boolean
    : TValues[K] extends object
    ? FormikTouched<TValues[K]>
    : boolean;
};

/**
 * Formik state tree
 */
export interface FormikState<TValues, TError = string> {
  /** Form values */
  values: TValues;
  /** map of field names to specific error for that field */
  errors: FormikErrors<TValues, TError>;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched<TValues>;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /** whether the form is currently validating (prior to submission) */
  isValidating: boolean;
  /** Top level status state, in case you need it */
  status?: any;
  /** Number of times user tried to submit the form */
  submitCount: number;
}

/**
 * Formik computed properties. These are read-only.
 */
export interface FormikComputedProps<TValues, TError = string> {
  /** True if any input has been touched. False otherwise. */
  readonly dirty: boolean;
  /** True if state.errors is empty */
  readonly isValid: boolean;
  /** The initial values of the form */
  readonly initialValues: TValues;
  /** The initial errors of the form */
  readonly initialErrors: FormikErrors<TValues, TError>;
  /** The initial visited fields of the form */
  readonly initialTouched: FormikTouched<TValues>;
  /** The initial status of the form */
  readonly initialStatus?: any;
}

/**
 * Formik state helpers
 */
export interface FormikHelpers<TValues, TError = string> {
  /** Manually set top level status. */
  setStatus(status?: any): void;
  /** Manually set errors object */
  setErrors(errors: FormikErrors<TValues, TError>): void;
  /** Manually set isSubmitting */
  setSubmitting(isSubmitting: boolean): void;
  /** Manually set touched object */
  setTouched(touched: FormikTouched<TValues>): void;
  /** Manually set values object  */
  setValues(values: TValues): void;
  /** Set value of form field directly */
  setFieldValue<TFieldName extends keyof TValues & string>(
    field: TFieldName,
    value: TValues[TFieldName],
    shouldValidate?: boolean
  ): void;
  /** Set error message of a form field directly */
  setFieldError(field: keyof TValues & string, message: TError): void;
  /** Set whether field has been touched directly */
  setFieldTouched(
    field: keyof TValues & string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ): void;
  /** Validate form values */
  validateForm(values?: TValues): Promise<FormikErrors<TValues, TError>>;
  /** Validate field value */
  validateField(field: keyof TValues & string): void;
  /** Reset form */
  resetForm(nextState?: Partial<FormikState<TValues, TError>>): void;
  /** Set Formik state, careful! */
  setFormikState(
    f:
      | FormikState<TValues, TError>
      | ((
          prevState: FormikState<TValues, TError>
        ) => FormikState<TValues, TError>),
    cb?: () => void
  ): void;
}

export interface FieldPropsQuery<
  TFieldName extends keyof TValues & string,
  TValues extends FormikValues
> {
  name: TFieldName;
  type?: string;
  value?: TValues[TFieldName];
  as?: string;
  multiple?: boolean;
}

/**
 * Formik form event handlers
 */
export interface FormikHandlers<TValues extends FormikValues, TError = string> {
  /** Form submit handler */
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  /** Reset form event handler  */
  handleReset: (e?: React.SyntheticEvent<any>) => void;
  /** Classic React blur handler, keyed by input name */
  handleBlur(e: React.FocusEvent<any>): void;
  /** Preact-like linkState. Will return a handleBlur function. */
  handleBlur<T = string | any>(
    fieldOrEvent: T
  ): T extends string ? ((e: any) => void) : void;
  /** Classic React change handler, keyed by input name */
  handleChange(e: React.ChangeEvent<any>): void;
  /** Preact-like linkState. Will return a handleChange function.  */
  handleChange<T = string | React.ChangeEvent<any>>(
    field: T
  ): T extends React.ChangeEvent<any>
    ? void
    : ((e: string | React.ChangeEvent<any>) => void);

  getFieldProps<TFieldName extends keyof TValues & string>(
    props: FieldPropsQuery<TFieldName, TValues>
  ): [
    FieldInputProps<TFieldName, TValues, TError>,
    FieldMetaProps<TValues[TFieldName], TError>
  ];
}

/**
 * Base formik configuration/props shared between the HoC and Component.
 */
export interface FormikSharedConfig<Props = {}> {
  /** Tells Formik to validate the form on each input's onChange event */
  validateOnChange?: boolean;
  /** Tells Formik to validate the form on each input's onBlur event */
  validateOnBlur?: boolean;
  /** Tell Formik if initial form values are valid or not on first render */
  isInitialValid?: boolean | ((props: Props) => boolean);
  /** Should Formik reset the form when new initialValues change */
  enableReinitialize?: boolean;
}

/**
 * <Formik /> props
 */
export interface FormikConfig<TValues, TError = string>
  extends FormikSharedConfig {
  /**
   * Form component to render
   */
  component?:
    | React.ComponentType<FormikProps<TValues, TError>>
    | React.ReactNode;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: (props: FormikProps<TValues, TError>) => React.ReactNode;

  /**
   * React children or child render callback
   */
  children?:
    | ((props: FormikProps<TValues, TError>) => React.ReactNode)
    | React.ReactNode;

  /**
   * Initial values of the form
   */
  initialValues: TValues;

  /**
   * Initial status
   */
  initialStatus?: any;

  /** Initial object map of field names to specific error for that field */
  initialErrors?: FormikErrors<TValues, TError>;

  /** Initial object map of field names to whether the field has been touched */
  initialTouched?: FormikTouched<TValues>;

  /**
   * Reset handler
   */
  onReset?: (
    values: TValues,
    formikHelpers: FormikHelpers<TValues, TError>
  ) => void;

  /**
   * Submission handler
   */
  onSubmit: (
    values: TValues,
    formikHelpers: FormikHelpers<TValues, TError>
  ) => void;
  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | (() => any);

  /**
   * Validation function. Must return an error object or promise that
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (
    values: TValues
  ) => void | object | Promise<FormikErrors<TValues, TError>>;
}

/**
 * State, handlers, and helpers made available to form component or render prop
 * of <Formik/>.
 */
export type FormikProps<TValues, TError = string> = FormikSharedConfig &
  FormikState<TValues, TError> &
  FormikHelpers<TValues, TError> &
  FormikHandlers<TValues, TError> &
  FormikComputedProps<TValues, TError> &
  FormikRegistration<TValues, TError> & { submitForm: () => Promise<void> };

/** Internal Formik registration methods that get passed down as props */
export interface FormikRegistration<TValues, TError = string> {
  registerField<TFieldName extends keyof TValues & string>(
    name: TFieldName,
    fns: { validate?: FieldValidator<TValues[TFieldName], TError> }
  ): void;
  unregisterField<TFieldName extends keyof TValues & string>(
    name: TFieldName
  ): void;
}

/**
 * State, handlers, and helpers made available to Formik's primitive components through context.
 */
export type FormikContext<TValues, TError = string> = FormikProps<
  TValues,
  TError
> &
  Pick<FormikConfig<TValues, TError>, 'validate' | 'validationSchema'>;

export interface SharedRenderProps<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: string | React.ComponentType<T | void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: (props: T) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: (props: T) => React.ReactNode;
}

export type GenericFieldHTMLAttributes =
  | JSX.IntrinsicElements['input']
  | JSX.IntrinsicElements['select']
  | JSX.IntrinsicElements['textarea'];

/** Field metadata */
export interface FieldMetaProps<TValue, TError = string> {
  /** Value of the field */
  value: TValue;
  /** TError message of the field */
  error?: TError;
  /** Has the field been visited? */
  touched: boolean;
  /** Initial value of the field */
  initialValue?: TValue;
  /** Initial touched state of the field */
  initialTouched: boolean;
  /** Initial error message of the field */
  initialError?: TError;
}

/** Field input value, name, and event handlers */
export interface FieldInputProps<
  TFieldName extends keyof TValues & string = any,
  TValues = FormikValues,
  TError = string
> {
  /** Value of the field */
  value: TValues[TFieldName];
  /** Name of the field */
  name: TFieldName;
  /** Multiple select? */
  multiple?: boolean;
  /** Is the field checked? */
  checked?: boolean;
  /** Change event handler */
  onChange: FormikHandlers<TValues, TError>['handleChange'];
  /** Blur event handler */
  onBlur: FormikHandlers<TValues, TError>['handleBlur'];
}

export type FieldValidator<TValue, TError = string> = (
  value: TValue
) => TError | void | Promise<TError | void>;
