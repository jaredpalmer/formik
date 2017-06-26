import * as React from 'react';
const hoistNonReactStatics = require('hoist-non-react-statics');

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
 * Given an object, map keys to boolean
 */
export function touchAllFields<T>(fields: T): { [field: string]: boolean } {
  let touched: { [field: string]: boolean } = {};
  for (let k of Object.keys(fields)) {
    touched[k] = true;
  }
  return touched;
}
/**
 * Validate a yup schema.
 */
export function validateFormData<T>(data: T, schema: any): Promise<void> {
  let validateData: any = {};
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      const key = String(k);
      validateData[key] = (data as any)[key] !== ''
        ? (data as any)[key]
        : undefined;
    }
  }
  return schema.validate(validateData, { abortEarly: false });
}

export interface FormikValues {
  [field: string]: any;
}

// @todo make this limited to keys of values
export interface FormikErrors {
  [field: string]: string;
}

// @todo make this limited to keys of values
// interfact FormikTouched<Values, Field extends keyof Values> ??
export interface FormikTouched {
  [field: string]: boolean;
}

/**
 * Formik configuration options
 */
export interface FormikConfig<Props, Values, Payload> {
  displayName?: string;
  /* Map props to the form values */
  mapPropsToValues?: (props: Props) => Values;
  /* Map form values to submission payload */
  mapValuesToPayload?: (values: Values) => Payload;
  /*  Yup Schema */
  validationSchema: any;
  /* Submission handler */
  handleSubmit: (payload: Payload, formikBag: FormikBag<Props, Values>) => void;
}

/**
 * Formik state tree
 */
export interface FormikState<V> {
  /* Form values */
  values: V;
  /* Top level error, in case you need it */
  error?: any;
  /** map of field names to specific error for that field */
  errors: FormikErrors;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
}

/**
 * Formik state helpers
 */
export interface FormikActions<P, V> {
  /* Manually set top level error */
  setError: (e: any) => void;
  /* Manually set Errors */
  setErrors: (errors: FormikErrors) => void;
  /* Manually set isSubmitting */
  setSubmitting: (isSubmitting: boolean) => void;
  /* Manually set touched fields */
  setTouched: (touched: FormikTouched) => void;
  /* Manually set values  */
  setValues: (values: V) => void;
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

export default function formik<Props, Values extends FormikValues, Payload>({
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
  validationSchema,
  handleSubmit,
}: FormikConfig<Props, Values, Payload>): ComponentDecorator<
  Props,
  InjectedFormikProps<Props, Values>
> {
  return function wrapWithFormik(
    WrappedComponent: CompositeComponent<InjectedFormikProps<Props, Values>>
  ): any {
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

      setError = (error: any) => {
        this.setState({ error });
      };

      setSubmitting = (isSubmitting: boolean) => {
        this.setState({ isSubmitting });
      };

      handleChange = (e: React.ChangeEvent<any>) => {
        e.persist();
        const { type, name, id, value, checked } = e.target;
        const field = name ? name : id;
        const val = /number|range/.test(type)
          ? parseFloat(value)
          : /checkbox/.test(type) ? checked : value;

        const { values } = this.state;
        // Set form fields by name
        this.setState(state => ({
          ...state,
          values: {
            ...values as object,
            [field]: val,
          },
        }));
        // Validate against schema
        validateFormData<Values>(
          { ...values as any, [field]: val },
          validationSchema
        ).then(
          () => this.setState({ errors: {} }),
          (err: any) => this.setState({ errors: yupToFormErrors(err) })
        );
      };

      handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // setTouched();
        // setSubmitting(true);
        this.setState({
          touched: touchAllFields(this.state.values),
          isSubmitting: true,
        });
        const { values } = this.state;
        // Validate against schema
        validateFormData<Values>(values, validationSchema).then(
          () => {
            this.setState({ errors: {} });
            handleSubmit(mapValuesToPayload(this.state.values), {
              setTouched: this.setTouched,
              setErrors: this.setErrors,
              setError: this.setError,
              setSubmitting: this.setSubmitting,
              setValues: this.setValues,
              resetForm: this.resetForm,
              props: this.props,
            });
          },
          (err: any) =>
            this.setState({ isSubmitting: false, errors: yupToFormErrors(err) })
        );
      };

      handleBlur = (e: any) => {
        e.persist();
        const { name, id } = e.target;
        const field = name ? name : id;
        const { touched } = this.state;
        this.setTouched({ ...touched, [field]: true });
      };

      handleChangeValue = (field: string, value: any) => {
        const { touched, values } = this.state;
        // Set touched and form fields by name
        this.setState(state => ({
          ...state,
          values: {
            ...values as object,
            [field]: value,
          },
          touched: {
            ...touched as object,
            [field]: true,
          },
        }));
        // Validate against schema
        validateFormData<Values>(
          { ...values as any, [field]: value },
          validationSchema
        ).then(
          () => this.setState({ errors: {} }),
          (err: any) => this.setState({ errors: yupToFormErrors(err) })
        );
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
            {...this.props as any}
            {...this.state as any}
            setError={this.setError}
            setErrors={this.setErrors}
            setSubmitting={this.setSubmitting}
            setTouched={this.setTouched}
            setValues={this.setValues}
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
    // Make sure we preserve any custom statics on the original component.
    // @see https://github.com/apollographql/react-apollo/blob/master/src/graphql.tsx
    return hoistNonReactStatics(Formik, WrappedComponent);
  };
}
