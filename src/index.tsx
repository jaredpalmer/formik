// import compose from 'recompose/compose';
// import mapProps from 'recompose/mapProps';
// import setDisplayName from 'recompose/setDisplayName';
// import withState from 'recompose/withState';
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

export interface FormikConfig<Props, FormState, Payload> {
  displayName: string;
  mapPropsToFormState?: (props: Props) => FormState;
  mapFormStateToPayload?: (formState: FormState) => Payload;
  validationSchema: any;
  handleSubmit: (payload: Payload) => void;
}

export interface FormikState<T> {
  form?: T;
  /** map of field names to specific error for that field */
  errors: FormikErrors;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
}

export interface InjectedFormikProps {
  /** map of field names to specific error for that field */
  errors: FormikErrors;
  /** map of field names to whether the field has been touched */
  touched: FormikTouched;
  /** whether the form is currently submitting */
  isSubmitting: boolean;

  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChange: (e: React.ChangeEvent<any>) => void;
}

export interface FormikErrors {
  [field: string]: string;
}

export interface FormikTouched {
  [field: string]: boolean;
}

export default function Formik<Props, State, Payload>({
  displayName,
  mapPropsToFormState = formProps => formProps,
  mapFormStateToPayload = formPartialState => {
    // in this case State and Payload are the same.
    const payload = (formPartialState as any) as Payload;
    return payload;
  },
  validationSchema,
  handleSubmit,
}: FormikConfig<Props, State, Payload>): ComponentEnhancer<{}, Props> {
  return compose<{}, Props>(
    setDisplayName(displayName),
    withState('form', 'setForm', (props: Props) => mapPropsToFormState(props)),
    withState('errors', 'setErrors', {}),
    withState('touched', 'setTouched', {}),
    withState('isSubmitting', 'setSubmitting', false),
    mapProps(({ // onSubmit,
      form, errors, touched, isSubmitting, setErrors, setForm, setTouched, setSubmitting, ...rest }) => ({
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
        setForm({ ...form, [name]: val });
        // Validate against schema
        validateFormData<State>(
          { ...form, [name]: val },
          validationSchema,
          setErrors
        );
      },
      onSubmit: (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setTouched(touchAllFields(form));
        validateFormData<State>(
          form,
          validationSchema,
          setErrors
        ).then((isValid: boolean) => {
          console.log('isValid:' + isValid);
          if (isValid) {
            handleSubmit(mapFormStateToPayload(form));
          }
        });
      },
      setForm,
      setErrors,
      setSubmitting,
      errors,
      isSubmitting,
      touched,
      ...rest,
      ...form,
    }))
  );
}
