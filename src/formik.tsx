import * as React from 'react';

import { isFunction, isPromise, isReactNative, values } from './utils';

import { hoistNonReactStatics } from './hoistStatics';

/**
 * Values of fields in the form
 */
export interface FormikValues {
  [field: string]: any;
}

/**
 * An object containing error messages whose keys correspond to FormikValues.
 */
export type FormikErrors<Values extends FormikValues> = {
  [Key in keyof Values]?: string
};

/**
 * An object containing touched state of the form whose keys correspond to FormikValues.
 */
export type FormikTouched<Values extends FormikValues> = {
  [Key in keyof Values]?: boolean
};

/**
 * Formik configuration options
 */
export interface FormikConfig<
  Props,
  Values extends FormikValues,
  DeprecatedPayload = Values
  // tslint:disable-next-line:one-line
> {
  displayName?: string;
  /** Map props to the form values */
  mapPropsToValues?: (props: Props) => Values;
  /** 
   * Map form values to submission payload 
   * @deprecated since 0.8.0
   */
  mapValuesToPayload?: (values: Values) => DeprecatedPayload;
  /** 
   * Validation function. Must return an error object or promise that 
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (
    values: Values,
    props: Props
  ) => void | FormikErrors<Values> | Promise<any>;
  /** A Yup Schema */
  validationSchema?: ((props: Props) => any) | any;
  /** Submission handler */
  handleSubmit: (
    values: Values | DeprecatedPayload,
    formikBag: FormikBag<Props, Values>
  ) => void;
  /** Tells Formik to validate the form on each input's onChange event */
  validateOnChange?: boolean;
  /** Tells Formik to validate the form on each input's onBlur event */
  validateOnBlur?: boolean;
  /** Tell Formik if initial form values are valid or not on first render */
  isInitialValid?: boolean | ((props: Props) => boolean | undefined);
}

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
export interface FormikComputedProps {
  /** True if any input has been touched. False otherwise. */
  readonly dirty: boolean;
  /** Result of isInitiallyValid on mount, then whether true values pass validation. */
  readonly isValid: boolean;
}

/**
 * Formik state helpers
 */
export interface FormikActions<Props, Values> {
  /** Manually set top level status. */
  setStatus: (status?: any) => void;
  /** 
   * Manually set top level error 
   * @deprecated since 0.8.0
   */
  setError: (e: any) => void;
  /** Manually set errors object */
  setErrors: (errors: FormikErrors<Values>) => void;
  /** Manually set isSubmitting */
  setSubmitting: (isSubmitting: boolean) => void;
  /** Manually set touched object */
  setTouched: (touched: FormikTouched<Values>) => void;
  /** Manually set values object  */
  setValues: (values: Values) => void;
  /** Set value of form field directly */
  setFieldValue: (field: keyof Values, value: any) => void;
  /** Set error message of a form field directly */
  setFieldError: (field: keyof Values, message: string) => void;
  /** Set whether field has been touched directly */
  setFieldTouched: (field: keyof Values, isTouched?: boolean) => void;
  /** Reset form */
  resetForm: (nextProps?: Props) => void;
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

/**
 * State, handlers, and helpers injected as props into the wrapped form component.
 */
export type InjectedFormikProps<Props, Values> = Props &
  FormikState<Values> &
  FormikActions<Props, Values> &
  FormikHandlers &
  FormikComputedProps;

/**
 * Formik actions + { props }
 */
export type FormikBag<P, V> = { props: P } & FormikActions<P, V>;

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

export function Formik<Props, Values extends FormikValues, Payload = Values>({
  displayName,
  mapPropsToValues = vanillaProps => {
    let val: Values = {} as Values;
    for (let k in vanillaProps) {
      if (
        vanillaProps.hasOwnProperty(k) &&
        typeof vanillaProps[k] !== 'function'
      ) {
        val[k] = vanillaProps[k];
      }
    }
    return val;
  },
  mapValuesToPayload,
  validate,
  validationSchema,
  handleSubmit,
  validateOnChange = false,
  validateOnBlur = true,
  isInitialValid = false,
}: FormikConfig<Props, Values, Payload>): ComponentDecorator<
  Props,
  InjectedFormikProps<Props, Values>
> {
  return function wrapWithFormik(
    WrappedComponent: CompositeComponent<InjectedFormikProps<Props, Values>>
  ) {
    class Formik extends React.Component<Props, FormikState<Values>> {
      public static displayName = `Formik(${displayName ||
        WrappedComponent.displayName ||
        WrappedComponent.name ||
        'Component'})`;
      public static WrappedComponent = WrappedComponent;
      public props: Props;

      constructor(props: Props) {
        super(props);
        this.state = {
          values: mapPropsToValues(props),
          errors: {},
          touched: {},
          isSubmitting: false,
        };

        if (mapValuesToPayload) {
          console.warn(
            `Warning: Formik\'s mapValuesToPayload is deprecated and may be removed in future releases. Move that function to the first line of \`handleSubmit\` instead.`
          );
        }
      }

      setErrors = (errors: FormikErrors<Values>) => {
        this.setState({ errors });
      };

      setTouched = (touched: FormikTouched<Values>) => {
        this.setState({ touched });
        if (validateOnBlur) {
          this.runValidations(this.state.values);
        }
      };

      setValues = (values: Values) => {
        this.setState({ values });
        if (validateOnChange) {
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
      runValidationSchema = (values: Values, onSuccess?: Function) => {
        const schema = isFunction(validationSchema)
          ? validationSchema(this.props)
          : validationSchema;
        validateYupSchema<Values>(values, schema).then(
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
      runValidations = (values: Values) => {
        if (validationSchema) {
          this.runValidationSchema(values);
        }

        if (validate) {
          const maybePromisedErrors = validate(values, this.props);
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

        if (validateOnChange) {
          this.runValidations(
            {
              ...this.state.values as object,
              [field]: value,
            } as Values
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
          } as Values
        );
      };

      setFieldValue = (field: keyof Values, value: any) => {
        // Set form field by name
        this.setState(prevState => ({
          ...prevState,
          values: {
            ...prevState.values as object,
            [field]: value,
          },
        }));

        if (validateOnChange) {
          this.runValidations(
            {
              ...this.state.values as object,
              [field]: value,
            } as Values
          );
        }
      };

      handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.submitForm();
      };

      submitForm = () => {
        this.setState({
          touched: touchAllFields<FormikTouched<Values>>(this.state.values),
          isSubmitting: true,
        });

        if (validate) {
          const maybePromisedErrors =
            validate(this.state.values, this.props) || {};
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
        } else if (validationSchema) {
          this.runValidationSchema(this.state.values, this.executeSubmit);
        } else {
          this.executeSubmit();
        }
      };

      executeSubmit = () => {
        const values = mapValuesToPayload
          ? mapValuesToPayload(this.state.values)
          : this.state.values;
        handleSubmit(values, {
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

        if (validateOnBlur) {
          this.runValidations(this.state.values);
        }
      };

      setFieldTouched = (field: keyof Values, touched: boolean = true) => {
        // Set touched field by name
        this.setState(prevState => ({
          ...prevState,
          touched: {
            ...prevState.touched as object,
            [field]: touched,
          },
        }));

        if (validateOnBlur) {
          this.runValidations(this.state.values);
        }
      };

      setFieldError = (field: keyof Values, message: string) => {
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
          values: nextProps
            ? mapPropsToValues(nextProps)
            : mapPropsToValues(this.props),
        });
      };

      handleReset = () => {
        this.setState({
          isSubmitting: false,
          errors: {},
          touched: {},
          error: undefined,
          status: undefined,
          values: mapPropsToValues(this.props),
        });
      };

      render() {
        const dirty =
          values<boolean>(this.state.touched).filter(Boolean).length > 0;
        return (
          <WrappedComponent
            {...this.props}
            {...this.state}
            dirty={dirty}
            isValid={
              dirty
                ? this.state.errors &&
                  Object.keys(this.state.errors).length === 0
                : isInitialValid !== false && isFunction(isInitialValid)
                  ? (isInitialValid as (props: Props) => boolean)(this.props)
                  : isInitialValid as boolean
            }
            setStatus={this.setStatus}
            setError={this.setError}
            setFieldError={this.setFieldError}
            setErrors={this.setErrors}
            setSubmitting={this.setSubmitting}
            setTouched={this.setTouched}
            setFieldTouched={this.setFieldTouched}
            setValues={this.setValues}
            setFieldValue={this.setFieldValue}
            resetForm={this.resetForm}
            submitForm={this.submitForm}
            handleReset={this.handleReset}
            handleSubmit={this.handleSubmit}
            handleChange={this.handleChange}
            handleBlur={this.handleBlur}
            handleChangeValue={this.handleChangeValue}
          />
        );
      }
    }
    return hoistNonReactStatics<Props>(
      Formik,
      WrappedComponent as React.ComponentClass<
        InjectedFormikProps<Props, Values>
      > // cast type to ComponentClass (even if SFC)
    ) as React.ComponentClass<Props>;
  };
}

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors<Values>(yupError: any): FormikErrors<Values> {
  let errors: FormikErrors<Values> = {};
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

export function touchAllFields<T>(fields: T): FormikTouched<T> {
  let touched = {} as FormikTouched<T>;
  for (let k of Object.keys(fields)) {
    touched[k] = true;
  }
  return touched;
}
