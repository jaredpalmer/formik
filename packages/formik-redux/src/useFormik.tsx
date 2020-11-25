import * as React from 'react';
import isEqual from 'react-fast-compare';
import {
  FormikConfig,
  FormikState,
  FormikValues,
  FormikMessage,
  isFunction,
  emptyErrors,
  emptyTouched,
  formikReducer,
  useFormikCore,
} from '@formik/core';
import invariant from 'tiny-warning';

export function useFormik<Values extends FormikValues = FormikValues>({
  validateOnChange = true,
  validateOnBlur = true,
  validateOnMount = false,
  isInitialValid,
  enableReinitialize = false,
  onSubmit,
  ...rest
}: FormikConfig<Values>) {
  const props = {
    validateOnChange,
    validateOnBlur,
    validateOnMount,
    onSubmit,
    ...rest,
  };
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useEffect(() => {
      invariant(
        typeof isInitialValid === 'undefined',
        'isInitialValid has been deprecated and will be removed in future versions of Formik. Please use initialErrors or validateOnMount instead.'
      );
      // eslint-disable-next-line
    }, []);
  }

  /**
   * This is the true test of spacetime. Every method
   * Formik uses must carefully consider whether it
   * needs to use the ref or the render snapshot.
   *
   * The general rule is going to be,
   *       snapshot    ref
   * const [state, updateState] = useFormikThing();
   */
  const stateRef = React.useRef<FormikState<Values>>({
    initialValues: props.initialValues,
    initialErrors: props.initialErrors ?? emptyErrors,
    initialTouched: props.initialTouched ?? emptyTouched,
    initialStatus: props.initialStatus,
    values: props.initialValues,
    errors: props.initialErrors ?? emptyErrors,
    touched: props.initialTouched ?? emptyTouched,
    status: props.initialStatus,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    dirty: false,
  });

  /**
   * Breaking all the rules, re: "must be side-effect free"
   * BUT that's probably OK.
   *
   * The only things that should use stateRef are side effects themselves --
   * those things which need the latest value in order to compute their own latest value.
   */
  const refBoundFormikReducer = React.useCallback(
    (state: FormikState<Values>, msg: FormikMessage<Values>) => {
      const result = formikReducer(state, msg);

      stateRef.current = result;

      return result;
    },
    []
  );

  const getState = React.useCallback(() => stateRef.current, [stateRef]);

  const [state, dispatch] = React.useReducer<
    React.Reducer<FormikState<Values>, FormikMessage<Values>>
  >(refBoundFormikReducer, stateRef.current);

  /**
   * isMounted and ValidateOnMount effects
   */
  const isMounted = React.useRef<boolean>(false);

  React.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const formikApi = useFormikCore(getState, dispatch, props, isMounted);
  const { validateFormWithLowPriority, resetForm } = formikApi;

  React.useEffect(() => {
    if (
      isMounted.current === true &&
      !isEqual(stateRef.current.initialValues, props.initialValues)
    ) {
      dispatch({ type: 'RESET_VALUES', payload: props.initialValues });

      if (enableReinitialize) {
        resetForm();
      }

      if (validateOnMount) {
        validateFormWithLowPriority();
      }
    }
  }, [
    enableReinitialize,
    props.initialValues,
    resetForm,
    validateOnMount,
    validateFormWithLowPriority,
  ]);

  //
  // TODO: probably need to add this to the reducer so that isValid is initially
  // calculated during the useRef, and then isValid is recalculated during
  // SET_ISVALIDATING or something.
  //
  const isValid = React.useMemo(
    () =>
      typeof isInitialValid !== 'undefined'
        ? state.dirty
          ? state.errors && Object.keys(state.errors).length === 0
          : isInitialValid !== false && isFunction(isInitialValid)
          ? isInitialValid(props)
          : isInitialValid
        : state.errors && Object.keys(state.errors).length === 0,
    [isInitialValid, state.dirty, state.errors, props]
  );

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(stateRef.current.initialErrors, props.initialErrors)
    ) {
      dispatch({
        type: 'RESET_ERRORS',
        payload: props.initialErrors || emptyErrors,
      });
    }
  }, [enableReinitialize, props.initialErrors]);

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(stateRef.current.initialTouched, props.initialTouched)
    ) {
      dispatch({
        type: 'RESET_TOUCHED',
        payload: props.initialTouched || emptyTouched,
      });
    }
  }, [enableReinitialize, props.initialTouched]);

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(stateRef.current.initialStatus, props.initialStatus)
    ) {
      dispatch({
        type: 'RESET_STATUS',
        payload: props.initialStatus,
      });
    }
  }, [enableReinitialize, props.initialStatus]);

  return {
    // get a future snapshot when you need it!
    getState,
    // the state as of this render
    ...state,
    // the api itself
    ...formikApi,
    validateForm: formikApi.validateFormWithHighPriority,
    validateOnBlur,
    validateOnChange,
    validateOnMount,
    isValid,
  };
}
