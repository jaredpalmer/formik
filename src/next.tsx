import * as PropTypes from 'prop-types';
import * as React from 'react';

import { isFunction, isPromise, isReactNative, values } from './utils';

/**
 * Values of fields in the form
 */
export interface FormikValues {
  [field: string]: any;
}

/**
 * An object containing error messages whose keys correspond to FormikValues.
 */
export type FormikErrors = {
  [field: string]: string;
};

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 */
export type FormikTouched = {
  [field: string]: boolean;
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
  errors: FormikErrors;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /** Top level status state, in case you need it */
  status?: any;
}
/**
 * Formik computed properties. These are read-only.
 */
export interface FormikComputedProps {
  /** True if any input has been touched. False otherwise. */
  readonly dirty: boolean;
  /** Result of isInitiallyValid on mount, then whether true values pass validation. */
  readonly isValid: boolean;
}

/**
 * Formik state helpers
 */
export interface FormikActions<Values> {
  /** Manually set top level status. */
  setStatus: (status?: any) => void;
  /** 
   * Manually set top level error 
   * @deprecated since 0.8.0
   */
  setError: (e: any) => void;
  /** Manually set errors object */
  setErrors: (errors: FormikErrors) => void;
  /** Manually set isSubmitting */
  setSubmitting: (isSubmitting: boolean) => void;
  /** Manually set touched object */
  setTouched: (touched: FormikTouched) => void;
  /** Manually set values object  */
  setValues: (values: Values) => void;
  /** Set value of form field directly */
  setFieldValue: (field: keyof Values, value: any) => void;
  /** Set error message of a form field directly */
  setFieldError: (field: keyof Values, message: string) => void;
  /** Set whether field has been touched directly */
  setFieldTouched: (field: keyof Values, isTouched?: boolean) => void;
  /** Reset form */
  resetForm: (nextProps?: any) => void;
  /** Submit the form imperatively */
  submitForm: () => void;
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
  /** Change value of form field directly */
  handleChangeValue: (name: string, value: any) => void;
  /** Reset form event handler  */
  handleReset: () => void;
}

export interface FormikProps {
  getInitialValues: object;
  /** 
   * Validation function. Must return an error object or promise that 
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: ((values: any) => void | object | Promise<any>);
  /** A Yup Schema */
  validationSchema?: any;
  /** Submission handler */
  handleSubmit: (values: object, props: object) => void;
  /** Tells Formik to validate the form on each input's onChange event */
  validateOnChange?: boolean;
  /** Tells Formik to validate the form on each input's onBlur event */
  validateOnBlur?: boolean;
  /** Tell Formik if initial form values are valid or not on first render */
  isInitialValid?: boolean | ((props: object) => boolean | undefined);

  component?: React.ComponentType<FormComponentProps<any> | void>;
  render?: ((props: FormComponentProps<any>) => React.ReactNode);
  children?:
    | ((props: FormComponentProps<any>) => React.ReactNode)
    | React.ReactNode;
}

export type FormComponentProps<Values> = FormikState<Values> &
  FormikActions<Values> &
  FormikHandlers &
  FormikComputedProps;

const isEmptyChildren = (children: any) => React.Children.count(children) === 0;

export class Formik<
  Props extends FormikProps = FormikProps
> extends React.Component<Props, FormikState<any>> {
  static defaultProps = {
    validateOnChange: true,
    validateOnBlur: false,
    isInitialValid: false,
  };

  static childContextTypes = {
    formik: PropTypes.object,
  };

  getChildContext() {
    const dirty =
      values<boolean>(this.state.touched).filter(Boolean).length > 0;
    return {
      formik: {
        ...this.state,
        dirty,
        isValid: dirty
          ? this.state.errors && Object.keys(this.state.errors).length === 0
          : this.props.isInitialValid !== false &&
            isFunction(this.props.isInitialValid)
            ? (this.props.isInitialValid as (props: Props) => boolean)(
                this.props
              )
            : this.props.isInitialValid as boolean,
        handleSubmit: this.handleSubmit,
        handleChange: this.handleChange,
        handleBlur: this.handleBlur,
        handleReset: this.handleReset,
        setStatus: this.setStatus,
        setTouched: this.setTouched,
        setErrors: this.setErrors,
        setError: this.setError,
        setValues: this.setValues,
        setFieldError: this.setFieldError,
        setFieldValue: this.setFieldValue,
        setFieldTouched: this.setFieldTouched,
        setSubmitting: this.setSubmitting,
        resetForm: this.resetForm,
        submitForm: this.submitForm,
      },
    };
  }

  constructor(props: Props) {
    super(props);
    this.state = {
      values: props.getInitialValues || ({} as any),
      errors: {},
      touched: {},
      isSubmitting: false,
    };
  }

  setErrors = (errors: FormikErrors) => {
    this.setState({ errors });
  };

  setTouched = (touched: FormikTouched) => {
    this.setState({ touched });
    if (this.props.validateOnBlur) {
      this.runValidations(this.state.values);
    }
  };

  setValues = (values: FormikValues) => {
    this.setState({ values });
    if (this.props.validateOnChange) {
      this.runValidations(values);
    }
  };

  setStatus = (status?: any) => {
    this.setState({ status });
  };

  setError = (error: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Warning: Formik\'s setError(error) is deprecated and may be removed in future releases. Please use Formik\'s setStatus(status) instead. It works identically. For more info see https://github.com/jaredpalmer/formik#setstatus-status-any--void`
      );
    }
    this.setState({ error });
  };

  setSubmitting = (isSubmitting: boolean) => {
    this.setState({ isSubmitting });
  };

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  runValidationSchema = (values: FormikValues, onSuccess?: Function) => {
    const { validationSchema } = this.props;
    const schema = isFunction(validationSchema)
      ? validationSchema(this.props)
      : validationSchema;
    validateYupSchema(values, schema).then(
      () => {
        this.setState({ errors: {} });
        if (onSuccess) {
          onSuccess();
        }
      },
      (err: any) =>
        this.setState({ errors: yupToFormErrors(err), isSubmitting: false })
    );
  };

  /**
   * Run validations and update state accordingly
   */
  runValidations = (values: FormikValues) => {
    if (this.props.validationSchema) {
      this.runValidationSchema(values);
    }

    if (this.props.validate) {
      const maybePromisedErrors = (this.props.validate as any)(values);
      if (isPromise(maybePromisedErrors)) {
        (maybePromisedErrors as Promise<any>).then(
          () => {
            this.setState({ errors: {} });
          },
          errors => this.setState({ errors, isSubmitting: false })
        );
      } else {
        this.setErrors(maybePromisedErrors as FormikErrors);
      }
    }
  };

  handleChange = (e: React.ChangeEvent<any>) => {
    if (isReactNative) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `Warning: Formik's handleChange does not work with React Native. Use setFieldValue and within a callback instead. For more info see https://github.com/jaredpalmer/formikhttps://github.com/jaredpalmer/formik#react-native`
        );
      }
      return;
    }
    e.persist();
    const { type, name, id, value, checked, outerHTML } = e.target;
    const field = name ? name : id;
    const val = /number|range/.test(type)
      ? parseFloat(value)
      : /checkbox/.test(type) ? checked : value;

    if (!field && process.env.NODE_ENV !== 'production') {
      console.error(
        `Warning: You forgot to pass an \`id\` or \`name\` attribute to your input:

  ${outerHTML}

Formik cannot determine which value to update. For more info see https://github.com/jaredpalmer/formik#handlechange-e-reactchangeeventany--void
`
      );
    }

    // Set form fields by name
    this.setState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values as object,
        [field]: val,
      },
    }));

    if (this.props.validateOnChange) {
      this.runValidations(
        {
          ...this.state.values as object,
          [field]: value,
        } as Object
      );
    }
  };

  handleChangeValue = (field: string, value: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Warning: Formik\'s handleChangeValue is deprecated and may be removed in future releases. Use Formik's setFieldValue(field, value) and setFieldTouched(field, isTouched) instead. React will merge the updates under the hood and avoid a double render. For more info see https://github.com/jaredpalmer/formik#setfieldvalue-field-string-value-any--void`
      );
    }
    // Set touched and form fields by name
    this.setState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values as object,
        [field]: value,
      },
      touched: {
        ...prevState.touched as object,
        [field]: true,
      },
    }));

    this.runValidationSchema(
      {
        ...this.state.values as object,
        [field]: value,
      } as object
    );
  };

  setFieldValue = (field: string, value: any) => {
    // Set form field by name
    this.setState(prevState => ({
      ...prevState,
      values: {
        ...prevState.values as object,
        [field]: value,
      },
    }));

    if (this.props.validateOnChange) {
      this.runValidations(
        {
          ...this.state.values as object,
          [field]: value,
        } as object
      );
    }
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.submitForm();
  };

  submitForm = () => {
    this.setState({
      touched: touchAllFields<FormikTouched>(this.state.values),
      isSubmitting: true,
    });

    if (this.props.validate) {
      const maybePromisedErrors =
        (this.props.validate as any)(this.state.values) || {};
      if (isPromise(maybePromisedErrors)) {
        (maybePromisedErrors as Promise<any>).then(
          () => {
            this.setState({ errors: {} });
            this.executeSubmit();
          },
          errors => this.setState({ errors, isSubmitting: false })
        );
        return;
      } else {
        const isValid = Object.keys(maybePromisedErrors).length === 0;
        this.setState({
          errors: maybePromisedErrors as FormikErrors,
          isSubmitting: isValid,
        });

        // only submit if there are no errors
        if (isValid) {
          this.executeSubmit();
        }
      }
    } else if (this.props.validationSchema) {
      this.runValidationSchema(this.state.values, this.executeSubmit);
    } else {
      this.executeSubmit();
    }
  };

  executeSubmit = () => {
    this.props.handleSubmit(this.state.values, {
      setStatus: this.setStatus,
      setTouched: this.setTouched,
      setErrors: this.setErrors,
      setError: this.setError,
      setValues: this.setValues,
      setFieldError: this.setFieldError,
      setFieldValue: this.setFieldValue,
      setFieldTouched: this.setFieldTouched,
      setSubmitting: this.setSubmitting,
      resetForm: this.resetForm,
      submitForm: this.submitForm,
      props: this.props,
    });
  };

  handleBlur = (e: any) => {
    if (isReactNative) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `Warning: Formik's handleBlur does not work with React Native. Use setFieldTouched(field, isTouched) within a callback instead. For more info see https://github.com/jaredpalmer/formik#setfieldtouched-field-string-istouched-boolean--void`
        );
      }
      return;
    }
    e.persist();
    const { name, id } = e.target;
    const field = name ? name : id;
    this.setState(prevState => ({
      touched: { ...prevState.touched as object, [field]: true },
    }));

    if (this.props.validateOnBlur) {
      this.runValidations(this.state.values);
    }
  };

  setFieldTouched = (field: string, touched: boolean = true) => {
    // Set touched field by name
    this.setState(prevState => ({
      ...prevState,
      touched: {
        ...prevState.touched as object,
        [field]: touched,
      },
    }));

    if (this.props.validateOnBlur) {
      this.runValidations(this.state.values);
    }
  };

  setFieldError = (field: string, message: string) => {
    // Set form field by name
    this.setState(prevState => ({
      ...prevState,
      errors: {
        ...prevState.errors as object,
        [field]: message,
      },
    }));
  };

  resetForm = (nextProps?: Props) => {
    this.setState({
      isSubmitting: false,
      errors: {},
      touched: {},
      error: undefined,
      status: undefined,
      values: nextProps ? nextProps : this.props.getInitialValues,
    });
  };

  handleReset = () => {
    this.resetForm();
  };

  render() {
    const { component, render, children, isInitialValid } = this.props;
    const dirty =
      values<boolean>(this.state.touched).filter(Boolean).length > 0;
    const props = {
      ...this.state,
      dirty,
      isValid: dirty
        ? this.state.errors && Object.keys(this.state.errors).length === 0
        : isInitialValid !== false && isFunction(isInitialValid)
          ? (isInitialValid as (props: Props) => boolean)(this.props)
          : isInitialValid as boolean,
      handleSubmit: this.handleSubmit,
      handleChange: this.handleChange,
      handleBlur: this.handleBlur,
      handleReset: this.handleReset,
      setStatus: this.setStatus,
      setTouched: this.setTouched,
      setErrors: this.setErrors,
      setError: this.setError,
      setValues: this.setValues,
      setFieldError: this.setFieldError,
      setFieldValue: this.setFieldValue,
      setFieldTouched: this.setFieldTouched,
      setSubmitting: this.setSubmitting,
      resetForm: this.resetForm,
      submitForm: this.submitForm,
    };
    return component
      ? React.createElement(component as any, props)
      : render
        ? (render as any)(props)
        : children // children come last, always called
          ? typeof children === 'function'
            ? (children as (props: FormComponentProps<any>) => React.ReactNode)(
                props as FormComponentProps<any>
              )
            : !isEmptyChildren(children) ? React.Children.only(children) : null
          : null;
  }
}

export const Field: React.SFC<any> = (
  { component = 'input', name, ...props },
  context
) => {
  const bag =
    typeof component === 'string'
      ? {
          value: context.formik.values[name],
          onChange: context.formik.handleChange,
          onBlur: context.formik.handleBlur,
        }
      : context.formik;
  return React.createElement(component, {
    ...props,
    name,
    ...bag,
  });
};

Field.contextTypes = {
  formik: PropTypes.object,
};

export const Form: React.SFC<any> = (props, context) =>
  <form onSubmit={context.formik.handleSubmit} {...props} />;

Form.contextTypes = {
  formik: PropTypes.object,
};

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors(yupError: any): FormikErrors {
  let errors: FormikErrors = {};
  for (let err of yupError.inner) {
    if (!errors[err.path]) {
      errors[err.path] = err.message;
    }
  }
  return errors;
}

/**
 * Validate a yup schema.
 */
export function validateYupSchema<T>(data: T, schema: any): Promise<void> {
  let validateData: any = {};
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      const key = String(k);
      validateData[key] =
        (data as any)[key] !== '' ? (data as any)[key] : undefined;
    }
  }
  return schema.validate(validateData, { abortEarly: false });
}

export function touchAllFields<T>(fields: T): FormikTouched {
  let touched = {} as FormikTouched;
  for (let k of Object.keys(fields)) {
    touched[k] = true;
  }
  return touched;
}
