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
export type FormikErrors<Values> = {
  [K in keyof Values]?: Values[K] extends object
    ? FormikErrors<Values[K]>
    : string
};

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 */
export type FormikTouched<Values> = {
  [K in keyof Values]?: Values[K] extends object
    ? FormikTouched<Values[K]>
    : boolean
};

/**
 * Formik state tree
 */
export interface FormikState<Values> {
  /** Form values */
  values: Values;
  /** map of field names to specific error for that field */
  errors: FormikErrors<Values>;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched<Values>;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /** whether the form is currently validating (prior to submission) */
  isValidating: boolean;
  /** Top level status state, in case you need it */
  status?: any;
  /** Number of times user tried to submit the form */
  submitCount: number;
  /** Global form submission error */
  formError: any;
}

/**
 * Formik computed properties. These are read-only.
 */
export interface FormikComputedProps<Values> {
  /** True if any input has been touched. False otherwise. */
  readonly dirty: boolean;
  /** Result of isInitiallyValid on mount, then whether true values pass validation. */
  readonly isValid: boolean;
  /** initialValues */
  readonly initialValues: Values;
}

/**
 * Formik state helpers
 */
export interface FormikHelpers<Values> {
  /** Manually set top level status. */
  setStatus(status?: any): void;
  /** Manually set errors object */
  setErrors(errors: FormikErrors<Values>): void;
  /** Manually set isSubmitting */
  setSubmitting(isSubmitting: boolean): void;
  /** Manually set touched object */
  setTouched(touched: FormikTouched<Values>): void;
  /** Manually set values object  */
  setValues(values: Values): void;
  /** Set value of form field directly */
  setFieldValue(field: keyof Values & string, value: any): void;
  /** Set error message of a form field directly */
  setFieldError(field: keyof Values & string, message: string): void;
  /** Set whether field has been touched directly */
  setFieldTouched(field: keyof Values & string, isTouched?: boolean): void;
  /** Validate form values */
  validateForm(values?: any): Promise<FormikErrors<Values>>;
  /** Validate field value */
  validateField(field: string): void;
  /** Reset form */
  resetForm(nextValues?: Values): void;
  /** Submit the form imperatively */
  submitForm(): void;
  /** Set Formik state, careful! */
  setFormikState(
    f:
      | FormikState<Values>
      | ((prevState: FormikState<Values>) => FormikState<Values>),
    cb?: () => void
  ): void;
}

/**
 * Formik form event handlers
 */
export interface FormikHandlers {
  /** Form submit handler */
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  /** Reset form event handler  */
  handleReset: () => void;
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

  getFieldProps<Value = any>(
    name: string,
    type?: string
  ): [FieldInputProps<Value>, FieldMetaProps<Value>];
}

/**
 * Base formik configuration/props shared between the HoC and Component.
 */
export interface FormikSharedConfig {
  /** Tells Formik to validate the form on each input's onChange event */
  validateOnChange?: boolean;
  /** Tells Formik to validate the form on each input's onBlur event */
  validateOnBlur?: boolean;
  /** Tell Formik if initial form values are valid or not on first render */
  isInitialValid?: boolean | ((props: object) => boolean | undefined);
  /** Should Formik reset the form when new initialValues change */
  enableReinitialize?: boolean;
}

/**
 * <Formik /> props
 */
export interface FormikConfig<Values> extends FormikSharedConfig {
  /**
   * Form component to render
   */
  component?: React.ComponentType<FormikProps<Values>> | React.ReactNode;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: FormikProps<Values>) => React.ReactNode);

  /**
   * React children or child render callback
   */
  children?:
    | ((props: FormikProps<Values>) => React.ReactNode)
    | React.ReactNode;
  /**
   * Initial values of the form
   */
  initialValues: Values;

  /**
   * Initial status
   */
  initialStatus?: any;

  /**
   * Reset handler
   */
  onReset?: (values: Values, formikHelpers: FormikHelpers<Values>) => void;

  /**
   * Submission handler
   */
  onSubmit: (values: Values, formikHelpers: FormikHelpers<Values>) => void;
  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | (() => any);

  /**
   * Validation function. Must return an error object or promise that
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: ((
    values: Values
  ) => void | object | Promise<FormikErrors<Values>>);
}

/**
 * State, handlers, and helpers made available to form component or render prop
 * of <Formik/>.
 */
export type FormikProps<Values> = FormikSharedConfig &
  FormikState<Values> &
  FormikHelpers<Values> &
  FormikHandlers &
  FormikComputedProps<Values> &
  FormikRegistration;

/** Internal Formik registration methods that get passed down as props */
export interface FormikRegistration {
  registerField(
    name: string,
    fns: { validate?: ((value: any) => string | Promise<void> | undefined) }
  ): void;
  unregisterField(name: string): void;
}

/**
 * State, handlers, and helpers made available to Formik's primitive components through context.
 */
export type FormikContext<Values> = FormikProps<Values> &
  Pick<FormikConfig<Values>, 'validate' | 'validationSchema'>;

export interface SharedRenderProps<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: string | React.ComponentType<T | void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: T) => React.ReactNode);

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: T) => React.ReactNode);
}

export type GenericFieldHTMLAttributes =
  | JSX.IntrinsicElements['input']
  | JSX.IntrinsicElements['select']
  | JSX.IntrinsicElements['textarea'];

/** Field metadata */
export interface FieldMetaProps<Value> {
  /** Value of the field */
  value: Value;
  /** Error message of the field */
  error?: string;
  /** Has the field been visited? */
  touched: boolean;
  /** Initial value of the field */
  initialValue?: Value;
}

/** Field input value, name, and event handlers */
export interface FieldInputProps<Value> {
  /** Value of the field */
  value: Value;
  /** Name of the field */
  name: string;
  /** Change event handler */
  onChange: FormikHandlers['handleChange'];
  /** Blur event handler */
  onBlur: FormikHandlers['handleBlur'];
}
