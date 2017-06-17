import * as React from 'react';
/**
 * Given an error from yup validation, turn it into form errors
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
 * Given a FormState, return a `touched` value with all of the fields touched.
 */
export function touchAllFields<T>(fields: T): { [field: string]: boolean } {
  let touched: { [field: string]: boolean } = {};
  for (let k of Object.keys(fields)) {
    touched[k] = true;
  }
  return touched;
}

export function validateFormData<T>(
  data: T,
  schema: any,
  setErrors: (errors: FormikErrors) => void
): Promise<boolean> {
  let validateData: any = {};
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      const key = String(k);
      validateData[key] = (data as any)[key] !== ''
        ? (data as any)[key]
        : undefined;
    }
  }
  return schema.validate(validateData, { abortEarly: false }).then(
    () => {
      setErrors({});
      return true;
    },
    (err: any) => {
      setErrors(yupToFormErrors(err));
      return false;
    }
  );
}

export interface FormikConfig<Props, Values, Payload> {
  /* Map props to the form values */
  mapPropsToValues?: (props: Props) => Values;
  /* Map form values to submission payload */
  mapValuesToPayload?: (values: Values) => Payload;
  /*  Yup Schema */
  validationSchema: any;
  /* Submission handler */
  handleSubmit: (payload: Payload, formikBag: FormikBag) => void;
}

export interface InjectedFormikProps<Props, Values> {
  /* Form values */
  values: Values;
  /* Top level error, in case you need it */
  error?: any;
  /** map of field names to specific error for that field */
  errors: FormikErrors;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /* Form submit handler */
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /* Classic React change handler, keyed by input name */
  handleChange: (e: React.ChangeEvent<any>) => void;
  /* Mark input as touched */
  handleBlur: (e: any) => void;
  /* Change value of form field directly */
  handleChangeValue: (name: string, value: any) => void;
  /* Manually set top level error */
  setError: (e: any) => void;
  /* Reset form */
  resetForm: (nextProps?: Props) => void;
  /* Reset form event handler  */
  onReset: () => void;
}

export interface FormikBag {
  props: { [field: string]: any };
  setError: (error: any) => void;
  setErrors: (errors: FormikErrors) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setTouched: (touched: FormikTouched) => void;
  setValues: (values: FormikValues) => void;
}

export interface FormikValues {
  [field: string]: any;
}

export interface FormikErrors {
  [field: string]: string;
}

export interface FormikTouched {
  [field: string]: boolean;
}

export interface FormikState<Values extends FormikValues> {
  /* Form values */
  values: Values;
  /* Top level error, in case you need it */
  error?: any;
  /** map of field names to specific error for that field */
  errors: FormikErrors;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
}

export default function Formik<Props, Values extends FormikValues, Payload>({
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
}: FormikConfig<Props, Values, Payload>): (
  Comp: React.ComponentClass<Props> | React.StatelessComponent<Props>
) => React.ComponentClass<InjectedFormikProps<Props, Values>> {
  return function(
    Comp: React.ComponentClass<Props> | React.StatelessComponent<Props>
  ): React.ComponentClass<any> {
    class WrappedComponent extends React.Component<Props, FormikState<Values>> {
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
          validationSchema,
          this.setErrors
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
        validateFormData<Values>(
          this.state.values,
          validationSchema,
          this.setErrors
        ).then((isValid: boolean) => {
          if (isValid) {
            handleSubmit(mapValuesToPayload(this.state.values), {
              setTouched: this.setTouched,
              setErrors: this.setErrors,
              setError: this.setError,
              setSubmitting: this.setSubmitting,
              setValues: this.setValues,
              props: this.props,
            });
          }
        });
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
        // Set changed fields as touched
        this.setTouched({ ...touched, [field]: true });
        // Set form fields by name
        this.setValues({ ...values as any, [field]: value });
        // Validate against schema
        validateFormData<Values>(
          { ...values as any, [field]: value },
          validationSchema,
          this.setErrors
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
          <Comp
            {...this.props}
            {...this.state}
            setError={this.setError}
            setErrors={this.setErrors}
            setTouched={this.setTouched}
            setValues={this.setValues}
            handleSubmit={this.handleSubmit}
            handleChange={this.handleChange}
            handleBlur={this.handleBlur}
            handleChangeValue={this.handleChangeValue}
          />
        );
      }
    }

    WrappedComponent.displayName = `Formik(${getDisplayName(
      WrappedComponent
    )})`;

    return WrappedComponent;
  };
}
// This make debugging easier. Components will show as SSR(MyComponent) in
// react-dev-tools.
function getDisplayName(WrappedComponent: any): string {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}
