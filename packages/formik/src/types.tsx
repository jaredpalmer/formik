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
export type FormikErrors<Values extends FormikValues> = {
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
export type FormikTouched<Values extends FormikValues> = {
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
export interface FormikState<Values extends FormikValues> {
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
export interface FormikComputedProps<TValues extends FormikValues> {
  /** True if any input has been touched. False otherwise. */
  readonly dirty: boolean;
  /** True if state.errors is empty */
  readonly isValid: boolean;
  /** The initial values of the form */
  readonly initialValues: TValues;
  /** The initial errors of the form */
  readonly initialErrors: FormikErrors<TValues>;
  /** The initial visited fields of the form */
  readonly initialTouched: FormikTouched<TValues>;
  /** The initial status of the form */
  readonly initialStatus?: any;
}

/**
 * Formik state helpers
 */
export interface FormikHelpers<TValues extends FormikValues> {
  /** Manually set top level status. */
  setStatus: (status?: any) => void;
  /** Manually set errors object */
  setErrors: (errors: FormikErrors<TValues>) => void;
  /** Manually set isSubmitting */
  setSubmitting: (isSubmitting: boolean) => void;
  /** Manually set touched object */
  setTouched: (
    touched: FormikTouched<TValues>,
    shouldValidate?: boolean
  ) => void;
  /** Manually set values object  */
  setValues: (
    values: React.SetStateAction<TValues>,
    shouldValidate?: boolean
  ) => void;
  /** Set value of form field directly */
  setFieldValue: (
    field: FormikValueKeys<TValues>,
    value: any,
    shouldValidate?: boolean
  ) => Promise<void | FormikErrors<TValues>>;
  /** Set error message of a form field directly */
  setFieldError: (field: FormikValueKeys<TValues>, message: string | undefined) => void;
  /** Set whether field has been touched directly */
  setFieldTouched: (
    field: FormikValueKeys<TValues>,
    isTouched?: boolean,
    shouldValidate?: boolean
  ) => void;
  /** Validate form values */
  validateForm: (values?: any) => Promise<FormikErrors<TValues>>;
  /** Validate field value */
  validateField: (field: FormikValueKeys<TValues>) => void;
  /** Reset form */
  resetForm: (nextState?: Partial<FormikState<TValues>>) => void;
  /** Submit the form imperatively */
  submitForm: () => Promise<void>;
  /** Set Formik state, careful! */
  setFormikState: (
    f:
      | FormikState<TValues>
      | ((prevState: FormikState<TValues>) => FormikState<TValues>),
    cb?: () => void
  ) => void;
}

export interface FormikBlurHandlerFn {
  /** Classic React blur handler, keyed by input name */
  (e: React.FocusEvent<any>): void;
  /** Preact-like linkState. Will return a handleBlur function. */
  <T = string | any>(fieldOrEvent: T): T extends string ? (e: any) => void : void;
}

export interface FormikChangeHandlerFn {
  /** Classic React change handler, keyed by input name */
  (e: React.ChangeEvent<any>): void;
  /** Preact-like linkState. Will return a handleChange function.  */
  <T = string | React.ChangeEvent<any>>(field: T): T extends React.ChangeEvent<any> ? void : (e: string | React.ChangeEvent<any>) => void;
}

/**
 * Formik form event handlers
 */
export interface FormikHandlers<TValues extends FormikValues> {
  /** Form submit handler */
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
  /** Reset form event handler  */
  handleReset: (e?: React.SyntheticEvent<any>) => void;
  handleBlur: FormikBlurHandlerFn;
  handleChange: FormikChangeHandlerFn;

  getFieldProps: <TFieldValue>(props: string | FieldConfig<TFieldValue>) => FieldInputProps<TFieldValue>;
  getFieldMeta: <TFieldValue>(name: FormikValueKeys<TValues>) => FieldMetaProps<TFieldValue>;
  getFieldHelpers: <TFieldValue>(name: FormikValueKeys<TValues>) => FieldHelperProps<TFieldValue>;
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
export interface FormikConfig<TValues extends FormikValues> extends FormikSharedConfig {
  /**
   * Form component to render
   */
  component?: React.ComponentType<FormikProps<TValues>>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   * @deprecated
   */
  render?: (props: FormikProps<TValues>) => React.ReactNode;

  /**
   * React children or child render callback
   */
  children?:
    | ((props: FormikProps<TValues>) => React.ReactNode)
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
  initialErrors?: FormikErrors<TValues>;

  /** Initial object map of field names to whether the field has been touched */
  initialTouched?: FormikTouched<TValues>;

  /**
   * Reset handler
   */
  onReset?: (values: TValues, formikHelpers: FormikHelpers<TValues>) => void;

  /**
   * Submission handler
   */
  onSubmit: (
    values: TValues,
    formikHelpers: FormikHelpers<TValues>
  ) => void | Promise<any>;
  /**
   * A Yup Schema or a function that returns a Yup schema
   */
  validationSchema?: any | (() => any);

  /**
   * Validation function. Must return an error object or promise that
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (values: TValues) => void | object | Promise<FormikErrors<TValues>>;

  /** Inner ref */
  innerRef?: React.Ref<FormikProps<TValues>>;
}

/**
 * State, handlers, and helpers made available to form component or render prop
 * of <Formik/>.
 */
export type FormikProps<TValues extends FormikValues> = FormikSharedConfig &
  FormikState<TValues> &
  FormikHelpers<TValues> &
  FormikHandlers<TValues> &
  FormikComputedProps<TValues> &
  FormikRegistration & { submitForm: () => Promise<any> };

/** Internal Formik registration methods that get passed down as props */
export interface FormikRegistration {
  registerField: (name: string, fns: { validate?: FieldValidator }) => void;
  unregisterField: (name: string) => void;
}

/**
 * State, handlers, and helpers made available to Formik's primitive components through context.
 */
export type FormikContextType<TValues extends FormikValues> = FormikProps<TValues> &
  Pick<FormikConfig<TValues>, 'validate' | 'validationSchema'>;

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
  setValue: (value: Value, shouldValidate?: boolean) => void;
  /** Set the field's touched value */
  setTouched: (value: boolean, shouldValidate?: boolean) => void;
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
  onChange: FormikChangeHandlerFn;
  /** Blur event handler */
  onBlur: FormikBlurHandlerFn;
}

export type FieldValidator = (
  value: any
) => string | void | Promise<string | void>;

export type FormikValueKeys<TValues extends object> = FlatProperties<TValues, '.'>;

type FlatProperties<TObject extends object, TSeparator extends string> = 
| `${keyof TObject & (string | number)}`
| {
  [K in keyof TObject]: 
    TObject[K] extends object ?
    `${K & (string | number)}${TSeparator}${FlatProperties<TObject[K], TSeparator>}` :
    never;
}[keyof TObject];
