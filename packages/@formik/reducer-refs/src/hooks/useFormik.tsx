import * as React from 'react';
import isEqual from 'react-fast-compare';
import {
  FormikConfig,
  FormikState,
  FormikValues,
  FormikMessage,
  emptyErrors,
  emptyTouched,
  useFormikCore,
  useIsomorphicLayoutEffect,
  FormikHelpers,
  useEventCallback,
  selectHandleReset,
} from '@formik/core';
import invariant from 'tiny-warning';
import {
  FormEffect,
  FormikRefApi,
  FormikRefState,
  UnsubscribeFn,
} from '../types';
import { formikRefReducer } from '../ref-reducer';
import { selectRefGetFieldMeta, selectRefResetForm } from '../ref-selectors';

export const useFormik = <Values extends FormikValues = FormikValues>(
  rawProps: FormikConfig<Values, FormikRefState<Values>>
): FormikRefApi<Values> => {
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

  // these are only used for initialization,
  // then abandoned because they will be managed in stateRef
  const initialValues = React.useRef(props.initialValues);
  const initialErrors = React.useRef(props.initialErrors ?? emptyErrors);
  const initialTouched = React.useRef(props.initialTouched ?? emptyTouched);
  const initialStatus = React.useRef(props.initialStatus);

  /**
   * This is the true test of spacetime. Every method
   * Formik uses must carefully consider whether it
   * needs to use the ref or the render snapshot.
   *
   * The general rule is going to be,
   *       snapshot    ref
   * const [state, updateState] = useFormikThing();
   */
  const stateRef = React.useRef<FormikRefState<Values>>({
    initialValues: initialValues.current,
    initialErrors: initialErrors.current,
    initialTouched: initialTouched.current,
    initialStatus: initialStatus.current,
    values: props.initialValues,
    errors: props.initialErrors ?? emptyErrors,
    touched: props.initialTouched ?? emptyTouched,
    status: props.initialStatus,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
    dirty: false,
  });

  const formListeners = React.useRef<FormEffect<Values>[]>([]);

  /**
   * Breaking all the rules, re: "must be side-effect free"
   * BUT that's probably OK??
   *
   * The only things that should use stateRef are side effects / event callbacks --
   * those things which need the latest value in order to compute their own latest value.
   */
  const refBoundFormikReducer = React.useCallback(
    (
      state: FormikState<Values> & FormikRefState<Values>,
      msg: FormikMessage<Values, FormikRefState<Values>>
    ) => {
      // decorate the core Formik reducer with one which tracks dirty and initialX in state
      const result = formikRefReducer(state, msg);

      stateRef.current = result;

      return result;
    },
    [stateRef]
  );

  const getState = React.useCallback(() => stateRef.current, [stateRef]);
  const [state, dispatch] = React.useReducer(
    refBoundFormikReducer,
    stateRef.current
  );

  /**
   * Refs
   */
  const isMounted = React.useRef<boolean>(false);

  // override some APIs to dispatch additional information
  // isMounted is the only ref we actually use, as we
  // override initialX.current with state.initialX
  const {
    resetForm: unusedResetForm,
    handleReset: unusedHandleReset,
    getFieldMeta: unusedGetFieldMeta,
    ...formikCoreApi
  } = useFormikCore(getState, dispatch, props, {
    initialValues,
    initialTouched,
    initialErrors,
    initialStatus,
    isMounted,
  });

  const getFieldMeta = useEventCallback(selectRefGetFieldMeta(getState), [
    getState,
  ]);

  const imperativeMethods: FormikHelpers<Values, FormikRefState<Values>> = {
    ...formikCoreApi,
    resetForm: (nextState?: Partial<FormikRefState<Values>> | undefined) =>
      resetForm(nextState),
  };

  const resetForm = useEventCallback(
    selectRefResetForm(
      getState,
      dispatch,
      props.initialErrors,
      props.initialTouched,
      props.initialStatus,
      props.onReset,
      imperativeMethods
    ),
    [getState, dispatch]
  );

  const handleReset = useEventCallback(selectHandleReset(resetForm), [
    resetForm,
  ]);

  const { validateForm } = imperativeMethods;

  const addFormEffect = React.useCallback(
    (effect: FormEffect<Values>): UnsubscribeFn => {
      formListeners.current = [...formListeners.current, effect];

      // in case a change occurred
      // if it didn't, react's state will not update anyway
      effect(stateRef.current);

      return () => {
        const listenerIndex = formListeners.current.findIndex(
          listener => listener === effect
        );

        formListeners.current = [
          ...formListeners.current.slice(0, listenerIndex),
          ...formListeners.current.slice(listenerIndex + 1),
        ];
      };
    },
    [formListeners, stateRef]
  );

  React.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  /**
   * Is this too expensive for a Layout effect? Maybe. But really, by moving it to a regular effect,
   * aren't you just delaying the _next_ render? i.e. when a user types the _second_ letter? So does it really matter?
   */
  useIsomorphicLayoutEffect(() => {
    formListeners.current.forEach(listener => listener(state));
  }, [state]);

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
        validateForm();
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
    // the core api
    ...formikCoreApi,
    // the overrides
    resetForm,
    handleReset,
    getFieldMeta,
    // extra ref goodies
    getState,
    addFormEffect,
    // validation config
    validateOnBlur,
    validateOnChange,
    validateOnMount,
  };
};
