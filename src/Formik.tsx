import * as React from 'react';
import isEqual from 'react-fast-compare';
import {
  FormikConfig,
  FormikErrors,
  FormikState,
  FormikTouched,
  FormikCtx,
} from './types';
import { isFunction } from './utils';

// Create Formik Context
export const FormikContext = React.createContext<FormikCtx<any>>({} as any);

// We already used FormikActions. So we'll go all Elm-y, and use Message.
type FormikMessage<Values> =
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'SUBMIT_FAILURE'; payload: FormikErrors<Values> }
  | { type: 'SUBMIT_SUCESS' }
  | { type: 'SET_ISVALIDATING'; payload: boolean }
  | { type: 'SET_ISSUBMITTING'; payload: boolean }
  | { type: 'SET_VALUES'; payload: Values }
  | { type: 'SET_TOUCHED'; payload: FormikTouched<Values> }
  | { type: 'SET_ERRORS'; payload: FormikErrors<Values> }
  | { type: 'SET_STATUS'; payload: any };

// State reducer
function formikReducer<Values>(
  state: FormikState<Values>,
  msg: FormikMessage<Values>
) {
  switch (msg.type) {
    case 'SET_VALUES':
      return { ...state, values: msg.payload };
    case 'SET_TOUCHED':
      return { ...state, touched: msg.payload };
    case 'SET_ERRORS':
      return { ...state, errors: msg.payload };
    case 'SET_STATUS':
      return { ...state, status: msg.payload };
    case 'SET_ISVALIDATING':
      return { ...state, isValidating: msg.payload };
    case 'SET_ISSUBMITTING':
      return { ...state, isSubmitting: msg.payload };
    default:
      return state;
  }
}

export function useFormik<Values = object, ExtraProps = {}>(
  props: FormikConfig<Values> & ExtraProps
) {
  const initialValues = React.useRef(props.initialValues);
  React.useEffect(
    () => {
      initialValues.current = props.initialValues;
    },
    [props.initialValues]
  );

  const [state, dispatch] = React.useReducer<
    FormikState<Values>,
    FormikMessage<Values>
  >(formikReducer, {
    values: props.initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  });

  function registerField() {
    throw new Error('not yet implemented');
  }

  function unregisterField() {
    throw new Error('not yet implemented');
  }

  function handleBlur() {
    throw new Error('not yet implemented');
  }

  function handleChange() {
    throw new Error('not yet implemented');
  }

  function handleReset() {
    throw new Error('not yet implemented');
  }

  function handleSubmit() {
    throw new Error('not yet implemented');
  }

  function resetForm() {
    throw new Error('not yet implemented');
  }

  function setTouched(touched: FormikTouched<Values>) {
    dispatch({ type: 'SET_TOUCHED', payload: touched });
  }

  function setErrors(errors: FormikErrors<Values>) {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }

  function setValues(values: Values) {
    dispatch({ type: 'SET_VALUES', payload: values });
  }

  function setFieldError() {
    throw new Error('not yet implemented');
  }

  function setFieldValue() {
    throw new Error('not yet implemented');
  }

  function setFieldTouched() {
    throw new Error('not yet implemented');
  }

  function setFormikState() {
    throw new Error('not yet implemented');
  }

  function setStatus(status: any) {
    dispatch({ type: 'SET_STATUS', payload: status });
  }

  function setSubmitting(isSubmitting: boolean) {
    dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting });
  }

  function submitForm() {
    throw new Error('not yet implemented');
  }
  const dirty = React.useMemo(() => !isEqual(initialValues, state.values), [
    initialValues,
    state.values,
  ]);

  const isValid = React.useMemo(
    () =>
      dirty
        ? state.errors && Object.keys(state.errors).length === 0
        : props.isInitialValid !== false && isFunction(props.isInitialValid)
          ? (props.isInitialValid as (props: FormikConfig<Values>) => boolean)(
              props
            )
          : (props.isInitialValid as boolean),
    [state.errors, props.isInitialValid]
  );
  const ctx = {
    ...state,
    initialValues: initialValues.current || props.initialValues,
    handleBlur,
    handleChange,
    handleReset,
    handleSubmit,
    resetForm,
    setErrors,
    setFormikState,
    setFieldTouched,
    setFieldValue,
    setFieldError,
    setStatus,
    setSubmitting,
    setTouched,
    setValues,
    submitForm,
    isValid,
    dirty,
    unregisterField,
    registerField,
  };

  return ctx;
}

export function Formik<Values = object, ExtraProps = {}>(
  props: FormikConfig<Values> & ExtraProps
) {
  const [formikbag] = useFormik<Values, ExtraProps>(props);
  return (
    <FormikContext.Provider value={formikbag}>
      {isFunction(props.children) ? props.children(formikbag) : props.children}
    </FormikContext.Provider>
  );
}
