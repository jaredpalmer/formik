import {
  ComponentEnhancer,
  compose,
  mapProps,
  setDisplayName,
  withState,
} from 'recompose';

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
  /* Component's display  name */
  displayName: string;
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
  error: any;
  /** map of field names to specific error for that field */
  errors: FormikErrors;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /* Form submit handler */
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  /* Classic React change handler, keyed by input name */
  onChange: (e: React.ChangeEvent<any>) => void;
  /* Change value of form field directly */
  onChangeValue: (name: string, value: any) => void;
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

export default function Formik<Props, State, Payload>({
  displayName,
  mapPropsToValues = formProps => formProps,
  mapValuesToPayload = formPartialState => {
    // in this case State and Payload are the same.
    const payload = (formPartialState as any) as Payload;
    return payload;
  },
  validationSchema,
  handleSubmit,
}: FormikConfig<Props, State, Payload>): ComponentEnhancer<{}, any> {
  return compose<{}, Props>(
    setDisplayName(displayName),
    withState('values', 'setValues', (props: Props) => mapPropsToValues(props)),
    withState('errors', 'setErrors', {}),
    withState('error', 'setError', undefined),
    withState('touched', 'setTouched', {}),
    withState('isSubmitting', 'setSubmitting', false),
    mapProps(
      ({
        values,
        error,
        errors,
        touched,
        isSubmitting,
        setError,
        setErrors,
        setValues,
        setTouched,
        setSubmitting,
        ...rest,
      }) => ({
        onChange: (e: React.ChangeEvent<any>) => {
          e.persist();
          const { type, name, value, checked } = e.target;
          const val = /number|range/.test(type)
            ? parseFloat(value)
            : /checkbox/.test(type)
              ? checked
              : /radio/.test(type) // is this needed?
                ? value
                : value;
          // Set changed fields as touched
          setTouched({ ...touched, [name]: true });
          // Set form fields by name
          setValues({ ...values, [name]: val });
          // Validate against schema
          validateFormData<State>(
            { ...values, [name]: val },
            validationSchema,
            setErrors
          );
        },
        onChangeValue: (name: string, value: any) => {
          // Set changed fields as touched
          setTouched({ ...touched, [name]: true });
          // Set form fields by name
          setValues({ ...values, [name]: value });
          // Validate against schema
          validateFormData<State>(
            { ...values, [name]: value },
            validationSchema,
            setErrors
          );
        },
        onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setTouched(touchAllFields(values));
          setSubmitting(true);
          setErrors({});
          setError(undefined);
          validateFormData<State>(
            values,
            validationSchema,
            setErrors
          ).then((isValid: boolean) => {
            console.log('isValid:' + isValid);
            if (isValid) {
              handleSubmit(mapValuesToPayload(values), {
                setTouched,
                setErrors,
                setError,
                setSubmitting,
                setValues,
                props: rest,
              });
            }
          });
        },
        resetForm: (nextProps?: Props) => {
          if (nextProps) {
            setValues(mapPropsToValues(nextProps));
          } else {
            setValues(mapPropsToValues(rest as Props));
          }
        },
        onReset: () => {
          setValues(mapPropsToValues(rest as Props));
        },
        setValues,
        setErrors,
        setSubmitting,
        errors,
        error,
        isSubmitting,
        touched,
        values,
        ...rest,
      })
    )
  );
}
