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
  handleReset: () => void;
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

export default function Formik<Props, Values extends FormikValues, Payload>({
  displayName,
  mapPropsToValues = props => {
    let values: FormikValues = {};
    for (let k in props) {
      if (props.hasOwnProperty(k) && typeof props[k] !== 'function') {
        values[k] = props[k];
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
}: FormikConfig<Props, Values, Payload>): ComponentEnhancer<{}, any> {
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
        ...otherProps,
      }) => ({
        handleChange: (e: React.ChangeEvent<any>) => {
          e.persist();
          const { type, name, id, value, checked } = e.target;
          const field = name ? name : id;
          const val = /number|range/.test(type)
            ? parseFloat(value)
            : /checkbox/.test(type) ? checked : value;
          // Set form fields by name
          setValues({ ...values, [field]: val });
          // Validate against schema
          validateFormData<Values>(
            { ...values, [field]: val },
            validationSchema,
            setErrors
          );
        },
        handleBlur: (e: any) => {
          e.persist();
          const { name, id } = e.target;
          const field = name ? name : id;
          setTouched({ ...touched, [field]: true });
        },
        handleChangeValue: (field: string, value: any) => {
          // Set changed fields as touched
          setTouched({ ...touched, [field]: true });
          // Set form fields by name
          setValues({ ...values, [field]: value });
          // Validate against schema
          validateFormData<Values>(
            { ...values, [field]: value },
            validationSchema,
            setErrors
          );
        },
        handleSubmit: (e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          setTouched(touchAllFields(values));
          setSubmitting(true);
          validateFormData<Values>(
            values,
            validationSchema,
            setErrors
          ).then((isValid: boolean) => {
            if (isValid) {
              handleSubmit(mapValuesToPayload(values), {
                setTouched,
                setErrors,
                setError,
                setSubmitting,
                setValues,
                props: otherProps,
              });
            }
          });
        },
        resetForm: (nextProps?: Props) => {
          setSubmitting(false);
          setErrors({});
          setTouched({});
          setError(undefined);
          if (nextProps) {
            setValues(mapPropsToValues(nextProps));
          } else {
            setValues(mapPropsToValues(otherProps as Props));
          }
        },
        handleReset: () => {
          setSubmitting(false);
          setErrors({});
          setTouched({});
          setError(undefined);
          setValues(mapPropsToValues(otherProps as Props));
        },
        setValues,
        setErrors,
        setSubmitting,
        errors,
        error,
        isSubmitting,
        touched,
        values,
        ...otherProps,
      })
    )
  );
}
