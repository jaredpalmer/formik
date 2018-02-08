import * as PropTypes from 'prop-types';
import * as React from 'react';
import isEqual from 'lodash.isequal';
import warning from 'warning';
import { GestureResponderEvent } from 'react-native';
import {
  isFunction,
  isPromise,
  isReactNative,
  isEmptyChildren,
  setDeep,
  setNestedObjectValues,
} from './utils';

/**
 * We need to fix a TypeScript x Yarn x React Native bug that occurs
 * when you try to use @types/node and @types/react-native in the
 * same project because of how react native's typings have their own
 * global declarations for require(). To fix this, Formik specifies all types
 * in tsconfig's compilerOptions explicitly (instead of TS inferring them from
 * ./node_modules/@types/**) and then must declare the only parts of @types/node it needs: process.env
 *
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15960
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/15960#issuecomment-354403930 (solution)
 */
declare const process: { env: { NODE_ENV: string } };

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
  setFieldError(field: keyof Values, message: string): void;
  setFieldError(field: string, message: string): void;
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
}

/** Overloded methods / types */
export interface FormikActions<Values> {
  /** Set value of form field directly */
  setFieldValue(field: string, value: any): void;
  /** Set error message of a form field directly */
  setFieldError(field: string, message: string): void;
  /** Set whether field has been touched directly */
  setFieldTouched(field: string, isTouched?: boolean): void;
  /** Set Formik state, careful! */
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
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement> | GestureResponderEvent
  ) => void;
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
  FormikComputedProps<Values>;

export class Formik<ExtraProps = {}, Values = object> extends React.Component<
  FormikConfig<Values> & ExtraProps,
  FormikState<any>
> {
  static defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
    isInitialValid: false,
    enableReinitialize: false,
  };

  static propTypes = {
    validateOnChange: PropTypes.bool,
    validateOnBlur: PropTypes.bool,
    isInitialValid: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    initialValues: PropTypes.object,
    onReset: PropTypes.func,
    onSubmit: PropTypes.func.isRequired,
    validationSchema: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    validate: PropTypes.func,
    component: PropTypes.func,
    render: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    enableReinitialize: PropTypes.bool,
  };

  static childContextTypes = {
    formik: PropTypes.object,
  };

  initialValues: Values;

  getChildContext() {
    return {
      formik: this.getFormikBag(),
    };
  }

  constructor(props: FormikConfig<Values> & ExtraProps) {
    super(props);
    this.state = {
      values: props.initialValues || ({} as any),
      errors: {},
      touched: {},
      isSubmitting: false,
    };

    this.initialValues = props.initialValues || ({} as any);
  }

  componentWillReceiveProps(
    nextProps: Readonly<FormikConfig<Values> & ExtraProps>
  ) {
    // If the initialValues change, reset the form
    if (
      this.props.enableReinitialize &&
      !isEqual(nextProps.initialValues, this.props.initialValues)
    ) {
      this.initialValues = nextProps.initialValues;
      this.resetForm(nextProps.initialValues);
    }
  }

  componentWillMount() {
    warning(
      !(this.props.component && this.props.render),
      'You should not use <Formik component> and <Formik render> in the same <Formik> component; <Formik render> will be ignored'
    );

    warning(
      !(
        this.props.component &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use <Formik component> and <Formik children> in the same <Formik> component; <Formik children> will be ignored'
    );

    warning(
      !(
        this.props.render &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use <Formik render> and <Formik children> in the same <Formik> component; <Formik children> will be ignored'
    );
  }

  setErrors = (errors: FormikErrors<Values>) => {
    this.setState({ errors });
  };

  setTouched = (touched: FormikTouched<Values>) => {
    this.setState({ touched }, () => {
      if (this.props.validateOnBlur) {
        this.runValidations(this.state.values);
      }
    });
  };

  setValues = (values: FormikValues) => {
    this.setState({ values }, () => {
      if (this.props.validateOnChange) {
        this.runValidations(values);
      }
    });
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
      ? validationSchema()
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
  runValidations = (values: FormikValues = this.state.values) => {
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
        this.setErrors(maybePromisedErrors as FormikErrors<Values>);
      }
    }
  };

  handleChange = (e: React.ChangeEvent<any>) => {
    if (isReactNative) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `Warning: Formik's handleChange does not work with React Native. Use setFieldValue and within a callback instead. For more info see https://github.com/jaredpalmer/formik#react-native`
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
      warnAboutMissingIdentifier({
        htmlContent: outerHTML,
        documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
        handlerName: 'handleChange',
      });
    }

    // Set form fields by name
    this.setState(prevState => ({
      ...prevState,
      values: setDeep(field, val, prevState.values),
    }));

    if (this.props.validateOnChange) {
      this.runValidations(setDeep(field, val, this.state.values));
    }
  };

  setFieldValue = (
    field: string,
    value: any,
    shouldValidate: boolean = true
  ) => {
    // Set form field by name
    this.setState(
      prevState => ({
        ...prevState,
        values: setDeep(field, value, prevState.values),
      }),
      () => {
        if (this.props.validateOnChange && shouldValidate) {
          this.runValidations(this.state.values);
        }
      }
    );
  };

  handleSubmit = (
    e: React.FormEvent<HTMLFormElement> | GestureResponderEvent
  ) => {
    e.preventDefault();
    this.submitForm();
  };

  submitForm = () => {
    // Recursively set all values to `true`.
    this.setState({
      touched: setNestedObjectValues<FormikTouched<Values>>(
        this.state.values,
        true
      ),
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
          errors: maybePromisedErrors as FormikErrors<Values>,
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
    this.props.onSubmit(this.state.values, this.getFormikActions());
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
    const { name, id, outerHTML } = e.target;
    const field = name ? name : id;

    if (!field && process.env.NODE_ENV !== 'production') {
      warnAboutMissingIdentifier({
        htmlContent: outerHTML,
        documentationAnchorLink: 'handleblur-e-any--void',
        handlerName: 'handleBlur',
      });
    }

    this.setState(prevState => ({
      touched: setDeep(field, true, prevState.touched),
    }));

    if (this.props.validateOnBlur) {
      this.runValidations(this.state.values);
    }
  };

  setFieldTouched = (
    field: string,
    touched: boolean = true,
    shouldValidate: boolean = true
  ) => {
    // Set touched field by name
    this.setState(
      prevState => ({
        ...prevState,
        touched: setDeep(field, touched, prevState.touched),
      }),
      () => {
        if (this.props.validateOnBlur && shouldValidate) {
          this.runValidations(this.state.values);
        }
      }
    );
  };

  setFieldError = (field: string, message: string) => {
    // Set form field by name
    this.setState(prevState => ({
      ...prevState,
      errors: setDeep(field, message, prevState.errors),
    }));
  };

  resetForm = (nextValues?: Values) => {
    if (nextValues) {
      this.initialValues = nextValues;
    }

    this.setState({
      isSubmitting: false,
      errors: {},
      touched: {},
      error: undefined,
      status: undefined,
      values: nextValues ? nextValues : this.props.initialValues,
    });
  };

  handleReset = () => {
    if (this.props.onReset) {
      const maybePromisedOnReset = (this.props.onReset as any)(
        this.state.values,
        this.getFormikActions()
      );

      if (isPromise(maybePromisedOnReset)) {
        (maybePromisedOnReset as Promise<any>).then(this.resetForm);
      } else {
        this.resetForm();
      }
    } else {
      this.resetForm();
    }
  };

  setFormikState = (s: any, callback?: (() => void)) =>
    this.setState(s, callback);

  getFormikActions = (): FormikActions<Values> => {
    return {
      resetForm: this.resetForm,
      submitForm: this.submitForm,
      validateForm: this.runValidations,
      setError: this.setError,
      setErrors: this.setErrors,
      setFieldError: this.setFieldError,
      setFieldTouched: this.setFieldTouched,
      setFieldValue: this.setFieldValue,
      setStatus: this.setStatus,
      setSubmitting: this.setSubmitting,
      setTouched: this.setTouched,
      setValues: this.setValues,
      setFormikState: this.setFormikState,
    };
  };

  getFormikComputedProps = () => {
    const { isInitialValid } = this.props;
    const dirty = !isEqual(this.initialValues, this.state.values);
    return {
      dirty,
      isValid: dirty
        ? this.state.errors && Object.keys(this.state.errors).length === 0
        : isInitialValid !== false && isFunction(isInitialValid)
          ? (isInitialValid as (props: this['props']) => boolean)(this.props)
          : (isInitialValid as boolean),
      initialValues: this.initialValues,
    };
  };

  getFormikBag = () => {
    return {
      ...this.state,
      ...this.getFormikActions(),
      ...this.getFormikComputedProps(),
      handleBlur: this.handleBlur,
      handleChange: this.handleChange,
      handleReset: this.handleReset,
      handleSubmit: this.handleSubmit,
      validateOnChange: this.props.validateOnChange,
      validateOnBlur: this.props.validateOnBlur,
    };
  };

  render() {
    const { component, render, children } = this.props;
    const props = this.getFormikBag();
    return component
      ? React.createElement(component as any, props)
      : render
        ? (render as any)(props)
        : children // children come last, always called
          ? typeof children === 'function'
            ? (children as any)(props)
            : !isEmptyChildren(children) ? React.Children.only(children) : null
          : null;
  }
}

function warnAboutMissingIdentifier({
  htmlContent,
  documentationAnchorLink,
  handlerName,
}: {
  htmlContent: string;
  documentationAnchorLink: string;
  handlerName: string;
}) {
  console.error(
    `Warning: \`${handlerName}\` has triggered and you forgot to pass an \`id\` or \`name\` attribute to your input:

    ${htmlContent}

    Formik cannot determine which value to update. For more info see https://github.com/jaredpalmer/formik#${documentationAnchorLink}
  `
  );
}

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors<Values>(yupError: any): FormikErrors<Values> {
  let errors: any = {} as FormikErrors<Values>;
  for (let err of yupError.inner) {
    if (!errors[err.path]) {
      errors = setDeep(err.path, err.message, errors);
    }
  }
  return errors;
}

/**
 * Validate a yup schema.
 */
export function validateYupSchema<T>(
  data: T,
  schema: any,
  context: any = {}
): Promise<void> {
  let validateData: any = {};
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      const key = String(k);
      validateData[key] =
        (data as any)[key] !== '' ? (data as any)[key] : undefined;
    }
  }
  return schema.validate(validateData, { abortEarly: false, context: context });
}

export * from './Field';
export * from './Form';
export * from './withFormik';
export * from './FieldArray';
