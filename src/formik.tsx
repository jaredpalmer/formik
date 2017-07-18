import * as React from 'react';

import { isPromise, isReactNative, touchAllFields } from './utils';

import { hoistNonReactStatics } from './hoistStatics';

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

/**
 * Values of fields in the form
 */
export interface FormikValues {
  [field: string]: any;
}

/**
 * An object containing error messages whose keys ideally correspond to FormikValues.
 * 
 * @todo make this limited to keys of values in typescript
 */
export interface FormikErrors {
  [field: string]: string;
}

/**
 * An objectg containing touched state of the form whose keys ideally correspond to FormikValues.
 * @todo make this limited to keys of valuesField extends keyof Values> ??
 */
export interface FormikTouched {
  // interface FormikTouched<Values,
  [field: string]: boolean;
}

/**
 * Formik configuration options
 */
export interface FormikConfig<Props, Values, Payload> {
  displayName?: string;
  /** Map props to the form values */
  mapPropsToValues?: (props: Props) => Values;
  /** Map form values to submission payload */
  mapValuesToPayload?: (values: Values) => Payload;
  /** 
   * Validation function. Must return an error object or promise that 
   * throws an error object where that object keys map to corresponding value.
   */
  validate?: (
    values: Values,
    props: Props
  ) => void | FormikErrors | Promise<any>;
  /** A Yup Schema */
  validationSchema?: any;
  /** Submission handler */
  handleSubmit: (payload: Payload, formikBag: FormikBag<Props, Values>) => void;
  /** Tells Formik to validate the form on each input's onChange event (default is onBlur event) */
  validateOnChange?: boolean;
}

/**
 * Formik state tree
 */
export interface FormikState<V> {
  /** Form values */
  values: V;
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
 * Formik state helpers
 */
export interface FormikActions<P, V> {
  /** Manually set top level status. */
  setStatus: (status?: any) => void;
  /** 
   * Manually set top level error 
   * @deprecated since 0.8.0
   */
  setError: (e: any) => void;
  /* Manually set errors object */
  setErrors: (errors: FormikErrors) => void;
  /* Manually set isSubmitting */
  setSubmitting: (isSubmitting: boolean) => void;
  /* Manually set touched object */
  setTouched: (touched: FormikTouched) => void;
  /* Manually set values object  */
  setValues: (values: V) => void;
  /* Set value of form field directly */
  setFieldValue: (field: string, value: any) => void;
  /* Set error message of a form field directly */
  setFieldError: (field: string, message: string) => void;
  /* Set whether field has been touched directly */
  setFieldTouched: (field: string, isTouched?: boolean) => void;
  /* Reset form */
  resetForm: (nextProps?: P) => void;
}

/**
 * Formik form event handlers 
 */
export interface FormikHandlers {
  /* Form submit handler */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /* Classic React change handler, keyed by input name */
  handleChange: (e: React.ChangeEvent<any>) => void;
  /* Mark input as touched */
  handleBlur: (e: any) => void;
  /* Change value of form field directly */
  handleChangeValue: (name: string, value: any) => void;
  /* Reset form event handler  */
  handleReset: () => void;
}

/**
 * State, handlers, and helpers injected as props into the wrapped form component.
 */
export type InjectedFormikProps<Props, Values> = Props &
  FormikState<Values> &
  FormikActions<Props, Values> &
  FormikHandlers;

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

export function Formik<Props, Values extends FormikValues, Payload>({
  displayName,
  mapPropsToValues = vanillaProps => {
    let values: Values = {} as Values;
    for (let k in vanillaProps) {
      if (
        vanillaProps.hasOwnProperty(k) &&
        typeof vanillaProps[k] !== 'function'
      ) {
        values[k] = vanillaProps[k];
      }
    }
    return values;
  },
  mapValuesToPayload = values => {
    // in this case Values and Payload are the same.
    const payload = (values as any) as Payload;
    return payload;
  },
  validate,
  validationSchema,
  handleSubmit,
  validateOnChange = false,
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
      }

      setErrors = (errors: FormikErrors) => {
        this.setState({ errors });
      };

      setTouched = (touched: FormikTouched) => {
        this.setState({ touched });
      };

      setValues = (values: Values) => {
        this.setState({ values });
      };

      setStatus = (status?: any) => {
        this.setState({ status });
      };

      setError = (error: any) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `Warning: Formik\'s setError(error) is deprecated and may be removed in future releases. Please use Formik\'s setStatus(status) instead. It works identically. See docs for more information: https://github.com/jaredpalmer/formik#setstatus-status-any--void`
          );
        }
        this.setState({ error });
      };

      setSubmitting = (isSubmitting: boolean) => {
        this.setState({ isSubmitting });
      };

      runValidationSchema = (values: Values, cb?: Function) => {
        validateYupSchema<Values>(values, validationSchema).then(
          () => {
            this.setState({ errors: {} });
            if (cb) {
              cb();
            }
          },
          (err: any) =>
            this.setState({ errors: yupToFormErrors(err), isSubmitting: false })
        );
      };

      runValidations = (values: Values) => {
        if (validate) {
          const maybePromisedErrors = validate(values, this.props);
          if (isPromise(maybePromisedErrors)) {
            (validate(values, this.props) as Promise<any>).then(
              () => {
                this.setState({ errors: {} });
              },
              errors => this.setState({ errors, isSubmitting: false })
            );
          } else {
            this.setErrors(maybePromisedErrors as FormikErrors);
          }
        }

        if (validationSchema) {
          this.runValidationSchema(values);
        }
      };

      handleChange = (e: React.ChangeEvent<any>) => {
        if (isReactNative) {
          console.error(
            `Warning: Formik's \`handleChange\` does not work with React Native. You should use \`setFieldValue(field, value)\` and within a callback instead. See docs for more information: https://github.com/jaredpalmer/formikhttps://github.com/jaredpalmer/formik#react-native`
          );
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

Formik cannot determine which value to update. See docs for more information: https://github.com/jaredpalmer/formik#handlechange-e-reactchangeeventany--void
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
            `Warning: Formik\'s \`handleChangeValue\` is deprecated and may be removed in future releases. Please use Formik's \`setFieldValue(field, value)\` together with \`setFieldTouched(field, isTouched)\` instead. See docs for more information: https://github.com/jaredpalmer/formik#setfieldvalue-field-string-value-any--void`
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
            ...prevState.touched,
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

      setFieldValue = (field: string, value: any) => {
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
        this.setState({
          touched: touchAllFields(this.state.values),
          isSubmitting: true,
        });

        if (validate) {
          const maybePromisedErrors =
            validate(this.state.values, this.props) || {};
          if (isPromise(maybePromisedErrors)) {
            (validate(this.state.values, this.props) as Promise<
              any
            >).then(() => {
              this.setState({ errors: {} });
              console.log('submitting');
              this.submitForm();
            }, errors => console.log(errors) || this.setState({ errors, isSubmitting: false }));
            return;
          } else {
            this.setState({
              errors: maybePromisedErrors as FormikErrors,
              isSubmitting: Object.keys(maybePromisedErrors).length > 0,
            });

            // only submit if there are no errors
            if (Object.keys(maybePromisedErrors).length === 0) {
              this.submitForm();
            }
          }
        } else if (validationSchema) {
          this.runValidationSchema(this.state.values, this.submitForm);
        } else {
          this.submitForm();
        }
      };

      submitForm = () => {
        handleSubmit(mapValuesToPayload(this.state.values), {
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
          props: this.props,
        });
      };

      handleBlur = (e: any) => {
        if (isReactNative) {
          console.error(
            `Warning: Formik's \`handleBlur\` does not work with React Native. You should use \`setFieldTouched(field, isTouched)\` and within a callback instead. See docs for more information: https://github.com/jaredpalmer/formik#setfieldtouched-field-string-istouched-boolean--void`
          );
          return;
        }
        e.persist();
        const { name, id } = e.target;
        const field = name ? name : id;
        this.setState(prevState => ({
          touched: { ...prevState.touched, [field]: true },
        }));

        if (!validateOnChange) {
          this.runValidations(this.state.values);
        }
      };

      setFieldTouched = (field: string, touched: boolean = true) => {
        // Set touched field by name
        this.setState(prevState => ({
          ...prevState,
          touched: {
            ...prevState.touched,
            [field]: touched,
          },
        }));

        if (!validateOnChange) {
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
          values: mapPropsToValues(this.props),
        });
      };

      render() {
        return (
          <WrappedComponent
            {...this.props}
            {...this.state}
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
