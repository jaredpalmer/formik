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
 *
 * @todo Remove any in TypeScript 2.8
 */
export type FormikErrors<Values> = { [field in keyof Values]?: any };

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 *
 * @todo Remove any in TypeScript 2.8
 */
export type FormikTouched<Values> = {
  [field in keyof Values]?: boolean & FormikTouched<Values[field]>
};

/**
 * Formik state tree
 */
export interface FormikState<Values> {
  /** Form values */
  values: Values;
  /**
   * Top level error, in case you need it
   * @deprecated since 0.8.0
   */
  error?: any;
  /** map of field names to specific error for that field */
  errors: FormikErrors<Values>;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched<Values>;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /** Top level status state, in case you need it */
  status?: any;
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
export interface FormikActions<Values> {
  /** Manually set top level status. */
  setStatus(status?: any): void;
  /**
   * Manually set top level error
   * @deprecated since 0.8.0
   */
  setError(e: any): void;
  /** Manually set errors object */
  setErrors(errors: FormikErrors<Values>): void;
  /** Manually set isSubmitting */
  setSubmitting(isSubmitting: boolean): void;
  /** Manually set touched object */
  setTouched(touched: FormikTouched<Values>): void;
  /** Manually set values object  */
  setValues(values: Values): void;
  /** Set value of form field directly */
  setFieldValue(
    field: keyof Values,
    value: any,
    shouldValidate?: boolean
  ): void;
  setFieldValue(field: string, value: any, shouldValidate?: boolean): void;
  /** Set error message of a form field directly */
  setFieldError(field: keyof Values, message?: string): void;
  setFieldError(field: string, message?: string): void;
  /** Set whether field has been touched directly */
  setFieldTouched(
    field: keyof Values,
    isTouched?: boolean,
    shouldValidate?: boolean
  ): void;
  setFieldTouched(
    field: string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ): void;
  /** Validate form values */
  validateForm(values?: any): void;
  /** Reset form */
  resetForm(nextValues?: any): void;
  /** Submit the form imperatively */
  submitForm(): void;
  /** Set Formik state, careful! */
  setFormikState<K extends keyof FormikState<Values>>(
    f: (
      prevState: Readonly<FormikState<Values>>,
      props: any
    ) => Pick<FormikState<Values>, K>,
    callback?: () => any
  ): void;
  setFormikState<K extends keyof FormikState<Values>>(
    state: Pick<FormikState<Values>, K>,
    callback?: () => any
  ): void;
}

/**
 * Formik form event handlers
 */
export interface FormikHandlers {
  /** Form submit handler */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /** Classic React change handler, keyed by input name */
  handleChange: (e: React.ChangeEvent<any>) => void;
  /** Mark input as touched */
  handleBlur: (e: any) => void;
  /** Reset form event handler  */
  handleReset: () => void;
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
   * Initial values of the form
   */
  initialValues: Values;

  /**
   * Reset handler
   */
  onReset?: (values: Values, formikActions: FormikActions<Values>) => void;

  /**
   * Submission handler
   */
  onSubmit: (values: Values, formikActions: FormikActions<Values>) => void;

  /**
   * Form component to render
   */
  component?: React.ComponentType<FormikProps<Values>> | React.ReactNode;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: FormikProps<Values>) => React.ReactNode);

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

  /**
   * React children or child render callback
   */
  children?:
    | ((props: FormikProps<Values>) => React.ReactNode)
    | React.ReactNode;
}

/**
 * State, handlers, and helpers made available to form component or render prop
 * of <Formik/>.
 */
export type FormikProps<Values> = FormikState<Values> &
  FormikActions<Values> &
  FormikHandlers &
  FormikComputedProps<Values> &
  Pick<FormikSharedConfig, 'validateOnChange' | 'validateOnBlur'>;

export type CompositeComponent<P> =
  | React.ComponentClass<P>
  | React.StatelessComponent<P>;

export interface ComponentDecorator<TOwnProps, TMergedProps> {
  (component: CompositeComponent<TMergedProps>): React.ComponentClass<
    TOwnProps
  >;
}

export interface InferableComponentDecorator<TOwnProps> {
  <T extends CompositeComponent<TOwnProps>>(component: T): T;
}

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
