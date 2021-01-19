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
  selectFieldMeta,
  isFunction,
  useCheckableEventCallback,
} from '@formik/core';
import invariant from 'tiny-warning';
import { FormikRefApi, FormikRefState } from '../types';
import { formikRefReducer } from '../ref-reducer';
import { selectRefGetFieldMeta, selectRefResetForm } from '../ref-selectors';
import {
  useEffect,
  useRef,
  useCallback,
  useReducer,
  MutableRefObject,
} from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import {
  FormikComparer,
  FormikSubscriber,
  UnsubscribeFn,
} from './createSubscriber';
import { FormikSelectorFn, FormikSliceFn } from './createSelector';
import {
  getOrCreateSubscription,
  getSubscription,
  selectGetOrCreateSubscription,
  selectInitSubscription,
} from '../helpers/subscription-helpers';

export type FormikSubscriptionUpdater<Return> = (value: Return) => void;

export interface FormikSubscriptionState<
  Values,
  Return,
  State = FormikState<Values>
> {
  selector: FormikSliceFn<Values, Return, State>;
  listeners: FormikSubscriptionUpdater<Return>[];
  prevStateRef: MutableRefObject<Return>;
}

export type FormikSubscriptionArgs<
  Values,
  Return,
  State = FormikState<Values>
> = {
  args: Map<any, FormikSubscriptionSet<Values, Return, State>>;
};

export type FormikSubscriptionSet<
  Values,
  Return,
  State = FormikState<Values>
> = Partial<FormikSubscriptionState<Values, Return, State>> &
  FormikSubscriptionArgs<Values, Return, State>;

export type FormikSelectorSubscriptionMap<
  Values,
  State = FormikState<Values>
> = Map<
  FormikSliceFn<Values, any, State> | FormikSelectorFn<Values, any, any, State>,
  FormikSubscriptionSet<Values, any, State>
>;

export type FormikSubscriptionMap<
  Values extends FormikValues,
  State extends FormikState<Values> = FormikState<Values>
> = Map<FormikComparer<any>, FormikSelectorSubscriptionMap<Values, State>>;

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
    useEffect(() => {
      invariant(
        typeof props.isInitialValid === 'undefined',
        'isInitialValid has been deprecated and will be removed in future versions of Formik. Please use initialErrors or validateOnMount instead.'
      );
      // eslint-disable-next-line
    }, []);
  }

  /**
   * Refs
   */
  const isMounted = useRef<boolean>(false);

  // these are only used for initialization,
  // then abandoned because they will be managed in stateRef
  const initialValues = useRef(props.initialValues);
  const initialErrors = useRef(props.initialErrors ?? emptyErrors);
  const initialTouched = useRef(props.initialTouched ?? emptyTouched);
  const initialStatus = useRef(props.initialStatus);

  /**
   * This is the true test of spacetime. Every method
   * Formik uses must carefully consider whether it
   * needs to use the ref or the render snapshot.
   *
   * The general rule is going to be,
   *       snapshot    ref
   * const [state, updateState] = useFormikThing();
   */
  const stateRef = useRef<FormikRefState<Values>>({
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

  /**
   * Breaking all the rules, re: "must be side-effect free"
   * BUT that's probably OK
   *
   * The only things that should use stateRef are side effects / event callbacks
   *
   */
  const refBoundFormikReducer = useCallback(
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

  const getState = useCallback(() => stateRef.current, [stateRef]);
  const [state, dispatch] = useReducer(refBoundFormikReducer, stateRef.current);

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

  const subscribersRef = useRef<
    FormikSubscriptionMap<Values, FormikRefState<Values>>
  >(new Map());

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

  const subscribers = {
    'Object.is': {
      selectFieldMeta: [
        {
          args: ['MyField', refs],
          listeners: [],
        },
        {
          args: ['MyOtherField', refs],
          listeners: [],
        },
      ],
    },
  };

  const initSubscription = useCheckableEventCallback(
    () => selectInitSubscription(getState),
    [getState]
  );

  const addFormEffect = useEventCallback(
    <Args extends any[], Return>(
      newSubscriber: FormikSubscriber<
        Values,
        Args,
        Return,
        FormikRefState<Values>
      >,
      updater: FormikSubscriptionUpdater<Return>
    ): UnsubscribeFn => {
      const subscription = getOrCreateSubscription(
        subscribersRef.current,
        newSubscriber,
        initSubscription
      );

      subscription?.listeners.push(updater);

      return () => {
        const subscription = getSubscription(
          subscribersRef.current,
          newSubscriber
        );

        if (subscription?.listeners) {
          subscription.listeners = subscription?.listeners.filter(
            listener => listener !== updater
          );
        }
      };
    },
    [subscribersRef, stateRef]
  );

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  useIsomorphicLayoutEffect(() => {
    unstable_batchedUpdates(() => {
      subscribersRef.current.forEach((selectors, comparer) =>
        selectors.forEach((subscription, selector))
      );
    });
  }, [state]);

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
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

  useEffect(() => {
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

  /**
   * Here, we memoize the API so that
   * React's Context doesn't update on every render.
   *
   * We don't useMemo because we're purposely
   * only updating when the config updates
   */
  return useMemo(
    () => ({
      // the core api
      ...formikCoreApi,
      // the overrides
      resetForm,
      handleReset,
      getFieldMeta,
      // extra goodies
      getState,
      createSelector,
      addFormEffect,
      // config
      validateOnBlur,
      validateOnChange,
      validateOnMount,
    }),
    [
      addFormEffect,
      createSelector,
      formikCoreApi,
      getFieldMeta,
      getState,
      handleReset,
      resetForm,
      validateOnBlur,
      validateOnChange,
      validateOnMount,
    ]
  );
};
