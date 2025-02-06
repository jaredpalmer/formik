import * as React from 'react';
import { FieldConfig } from './Field';
/**
 * Values of fields in the form
 */
export interface FormikValues {
  [field: string]: any;
}

/**
 * An object containing error messages whose keys correspond to FormikValues.
 * Should always be an object of strings, but any is allowed to support i18n libraries.
 */
export type FormikErrors<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikErrors<Values[K][number]>[] | string | string[]
      : string | string[]
    : Values[K] extends object
    ? FormikErrors<Values[K]>
    : string;
};

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 */
export type FormikTouched<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends object // [number] is the special sauce to get the type of array's element. More here https://github.com/Microsoft/TypeScript/pull/21316
      ? FormikTouched<Values[K][number]>[]
      : boolean
    : Values[K] extends object
    ? FormikTouched<Values[K]>
    : boolean;
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
}

/**
 * Formik computed properties. These are read-only.
 */
export interface FormikComputedProps<Values> {
  /** True if any input has been touched. False otherwise. */
  readonly dirty: boolean;
  /** True if state.errors is empty */
  readonly isValid: boolean;
  /** The initial values of the form */
  readonly initialValues: Values;
  /** The initial errors of the form */
  readonly initialErrors: FormikErrors<Values>;
  /** The initial visited fields of the form */
  readonly initialTouched: FormikTouched<Values>;
  /** The initial status of the form */
  readonly initialStatus?: any;
}

/**
 * Formik state helpers
 */
export interface FormikHelpers<Values> {
  /** Manually set top level status. */
  setStatus: (status?: any) => void;
  /** Manually set errors object */
  setErrors: (errors: FormikErrors<Values>) => void;
  /** Manually set isSubmitting */
  setSubmitting: (isSubmitting: boolean) => void;
  /** Manually set touched object */
  setTouched: (
    touched: FormikTouched<Values>,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<Values>>;
  /** Manually set values object  */
  setValues: (
    values: React.SetStateAction<Values>,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<Values>>;
  /** Set value of form field directly */
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<Values>>;
  /** Set error message of a form field directly */
  setFieldError: (field: string, message: string | undefined) => void;
  /** Set whether field has been touched directly */
  setFieldTouched: (
    field: string,
    isTouched?: boolean,
    shouldValidate?: boolean
  ) =>  Promise<void | FormikErrors<Values>>;
  /** Validate form values */
  validateForm: (values?: any) => Promise<FormikErrors<Values>>;
  /** Validate field value */
  validateField: (field: string) => Promise<void> | Promise<string | undefined>;
  /** Reset form */
  resetForm: (nextState?: Partial<FormikState<Values>>) => void;
  /** Submit the form imperatively */
  submitForm: () => Promise<void>;
  /** Set Formik state, careful! */
  setFormikState: (
    f:
      | FormikState<Values>
      | ((prevState: FormikState<Values>) => FormikState<Values>),
    cb?: () => void
  ) => void;
}

/**
 * Formik form event handlers
 */
export interface FormikHandlers {
  /** Form submit handler */
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  /** Reset form event handler  */
  handleReset: (e?: React.SyntheticEvent<any>) => void;
  handleBlur: {
    /** Classic React blur handler, keyed by input name */
    (e: React.FocusEvent<any>): void;
    /** Preact-like linkState. Will return a handleBlur function. */
    <T = string | any>(fieldOrEvent: T): T extends string
      ? (e: any) => void
      : void;
  };
  handleChange: {
    /** Classic React change handler, keyed by input name */
    (e: React.ChangeEvent<any>): void;
    /** Preact-like linkState. Will return a handleChange function.  */
    <T = string | React.ChangeEvent<any>>(
      field: T
    ): T extends React.ChangeEvent<any>
      ? void
      : (e: string | React.ChangeEvent<any>) => void;
  };

  getFieldProps: <Value = any>(
    props: string | FieldConfig<Value>
  ) => FieldInputProps<Value>;
  getFieldMeta: <Value>(name: string) => FieldMetaProps<Value>;
  getFieldHelpers: <Value = any>(name: string) => FieldHelperProps<Value>;
}

/**
 * Base formik configuration/props shared between the HoC and Component.
 */
export interface FormikSharedConfig<Props = {}> {
  /** Tells Formik to validate the form on each input's onChange event */
  validateOnChange?: boolean;
  /** Tells Formik to validate the form on each input's onBlur event */
  validateOnBlur?: boolean;
  /** Tells Formik to validate upon mount */
  validateOnMount?: boolean;
  /** Tell Formik if initial form values are valid or not on first render */
  isInitialValid?: boolean | ((props: Props) => boolean);
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
  component?: React.ComponentType<FormikProps<Values>>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FormikProps<Values>) => React.ReactNode;

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

  /** Initial object map of field names to specific error for that field */
  initialErrors?: FormikErrors<Values>;

  /** Initial object map of field names to whether the field has been touched */
  initialTouched?: FormikTouched<Values>;

  /**
   * Reset handler
   */
  onReset?: (values: Values, formikHelpers: FormikHelpers<Values>, initialValues?: Values) => void;

  /**
   * Submission handler
   */
  onSubmit: (
    values: Values,
    formikHelpers: FormikHelpers<Values>
  ) => void | Promise<any>;
  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | (() => any);

  /**
   * Validation function. Must return an error object or promise that
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (values: Values) => void | object | Promise<FormikErrors<Values>>;

  /** Inner ref */
  innerRef?: React.Ref<FormikProps<Values>>;
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
  FormikRegistration & { submitForm: () => Promise<any> };

/** Internal Formik registration methods that get passed down as props */
export interface FormikRegistration {
  registerField: (name: string, fns: { validate?: FieldValidator }) => void;
  unregisterField: (name: string) => void;
}

/**
 * State, handlers, and helpers made available to Formik's primitive components through context.
 */
export type FormikContextType<Values> = FormikProps<Values> &
  Pick<FormikConfig<Values>, 'validate' | 'validationSchema'>;

export interface SharedRenderProps<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: keyof JSX.IntrinsicElements | React.ComponentType<T | void>;

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
export interface FieldMetaProps<Value> {
  /** Value of the field */
  value: Value;
  /** Error message of the field */
  error?: string;
  /** Has the field been visited? */
  touched: boolean;
  /** Initial value of the field */
  initialValue?: Value;
  /** Initial touched state of the field */
  initialTouched: boolean;
  /** Initial error message of the field */
  initialError?: string;
}

/** Imperative handles to change a field's value, error and touched */
export interface FieldHelperProps<Value> {
  /** Set the field's value */
  setValue: (value: Value, shouldValidate?: boolean) => Promise<void | FormikErrors<Value>>;
  /** Set the field's touched value */
  setTouched: (value: boolean, shouldValidate?: boolean) => Promise<void | FormikErrors<Value>>;
  /** Set the field's error value */
  setError: (value: string | undefined) => void;
}

/** Field input value, name, and event handlers */
export interface FieldInputProps<Value> {
  /** Value of the field */
  value: Value;
  /** Name of the field */
  name: string;
  /** Multiple select? */
  multiple?: boolean;
  /** Is the field checked? */
  checked?: boolean;
  /** Change event handler */
  onChange: FormikHandlers['handleChange'];
  /** Blur event handler */
  onBlur: FormikHandlers['handleBlur'];
}

export type FieldValidator = (
  value: any
) => string | void | Promise<string | void>;
