import * as React from 'react';
import isEqual from 'react-fast-compare';
import { FormikProvider } from './FormikContext';
import invariant from 'tiny-warning';
import {
  emptyErrors,
  emptyTouched,
  FormikConfig,
  FormikErrors,
  FormikMessage,
  FormikProps,
  formikReducer,
  FormikState,
  FormikTouched,
  FormikValues,
  isEmptyChildren,
  isFunction,
  useEventCallback,
  useFormikCore,
} from '@formik/core';

export function useFormik<Values extends FormikValues = FormikValues>(
  rawProps: FormikConfig<Values>
): FormikProps<Values> {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    validateOnMount = false,
    enableReinitialize = false,
    ...rest
  } = rawProps;
  const props = {
    validateOnChange,
    validateOnBlur,
    validateOnMount,
    ...rest,
  };

  const initialValues = React.useRef<Values>(props.initialValues);
  const initialErrors = React.useRef<FormikErrors<Values>>(
    props.initialErrors || emptyErrors
  );
  const initialTouched = React.useRef<FormikTouched<Values>>(
    props.initialTouched || emptyTouched
  );
  const initialStatus = React.useRef(props.initialStatus);
  const isMounted = React.useRef<boolean>(false);

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        typeof props.isInitialValid === 'undefined',
        'isInitialValid has been deprecated and will be removed in future versions of Formik. Please use initialErrors or validateOnMount instead.'
      );
      // eslint-disable-next-line
    }, []);
  }

  React.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const [state, dispatch] = React.useReducer<
    React.Reducer<FormikState<Values>, FormikMessage<Values>>
  >(formikReducer, {
    values: props.initialValues,
    errors: props.initialErrors || emptyErrors,
    touched: props.initialTouched || emptyTouched,
    status: props.initialStatus,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  });

  const getState = useEventCallback(() => state, [state]);
  const formikApi = useFormikCore<Values, FormikState<Values>>(
    getState,
    dispatch,
    props,
    {
      initialValues,
      initialErrors,
      initialStatus,
      initialTouched,
      isMounted,
    }
  );

  const { resetForm, validateForm, isFormValid } = formikApi;

  const dirty = React.useMemo(
    () => !isEqual(initialValues.current, state.values),
    [initialValues.current, state.values]
  );

  const isValid = React.useMemo(() => isFormValid(state.errors, dirty), [
    dirty,
    state.errors,
  ]);

  React.useEffect(() => {
    if (
      validateOnMount &&
      isMounted.current === true &&
      isEqual(initialValues.current, props.initialValues)
    ) {
      validateForm(initialValues.current);
    }
  }, [validateOnMount, validateForm]);

  React.useEffect(() => {
    if (
      isMounted.current === true &&
      !isEqual(initialValues.current, props.initialValues)
    ) {
      if (enableReinitialize) {
        initialValues.current = props.initialValues;
        resetForm();
      }

      if (validateOnMount) {
        validateForm(initialValues.current);
      }
    }
  }, [
    enableReinitialize,
    props.initialValues,
    resetForm,
    validateOnMount,
    validateForm,
  ]);

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialErrors.current, props.initialErrors)
    ) {
      initialErrors.current = props.initialErrors || emptyErrors;
      dispatch({
        type: 'SET_ERRORS',
        payload: props.initialErrors || emptyErrors,
      });
    }
  }, [enableReinitialize, props.initialErrors]);

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialTouched.current, props.initialTouched)
    ) {
      initialTouched.current = props.initialTouched || emptyTouched;
      dispatch({
        type: 'SET_TOUCHED',
        payload: props.initialTouched || emptyTouched,
      });
    }
  }, [enableReinitialize, props.initialTouched]);

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialStatus.current, props.initialStatus)
    ) {
      initialStatus.current = props.initialStatus;
      dispatch({
        type: 'SET_STATUS',
        payload: props.initialStatus,
      });
    }
  }, [enableReinitialize, props.initialStatus, props.initialTouched]);

  const ctx = {
    ...state,
    initialValues: initialValues.current,
    initialErrors: initialErrors.current,
    initialTouched: initialTouched.current,
    initialStatus: initialStatus.current,
    ...formikApi,
    isValid,
    dirty,
    validateOnBlur,
    validateOnChange,
    validateOnMount,
  };

  return ctx;
}

export function Formik<
  Values extends FormikValues = FormikValues,
  ExtraProps = {}
>(props: FormikConfig<Values> & ExtraProps) {
  const formikbag = useFormik<Values>(props);
  const { component, children, render, innerRef } = props;

  // This allows folks to pass a ref to <Formik />
  React.useImperativeHandle(innerRef, () => formikbag);

  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        !props.render,
        `<Formik render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Formik render={(props) => ...} /> with <Formik>{(props) => ...}</Formik>`
      );
      // eslint-disable-next-line
    }, []);
  }
  return (
    <FormikProvider value={formikbag}>
      {component
        ? React.createElement(component as any, formikbag)
        : render
        ? render(formikbag)
        : children // children come last, always called
        ? isFunction(children)
          ? (children as (bag: FormikProps<Values>) => React.ReactNode)(
              formikbag as FormikProps<Values>
            )
          : !isEmptyChildren(children)
          ? React.Children.only(children)
          : null
        : null}
    </FormikProvider>
  );
}
