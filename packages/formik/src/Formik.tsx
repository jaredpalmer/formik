import * as React from 'react';
import isEqual from 'react-fast-compare';
import deepmerge from 'deepmerge';
import isPlainObject from 'lodash/isPlainObject';
import {
  FormikConfig,
  FormikErrors,
  FormikReducerState,
  FormikTouched,
  FormikValues,
  FormikProps,
  FormikHelpers,
  FormikApi,
  HandleBlurFn,
  HandleBlurEventFn,
  HandleChangeEventFn,
  HandleChangeFn,
  FormikSharedConfig,
  InputElements,
  FieldRegistry,
  FormikMessage,
} from './types';
import {
  isFunction,
  isString,
  setIn,
  isEmptyChildren,
  isPromise,
  getActiveElement,
  getIn,
  setNestedObjectValues,
} from './utils';
import { FormikProvider } from './FormikContext';
import invariant from 'tiny-warning';
import {
  IsFormValidFn,
  selectFullState,
} from './helpers/form-helpers';
import { useFormikSubscriptions } from './hooks/useFormikSubscriptions';
import { useEventCallback } from './hooks/useEventCallback';
import { selectFieldOnChange } from './helpers/field-helpers';

// State reducer
function formikReducer<Values>(
  state: FormikReducerState<Values>,
  msg: FormikMessage<Values>
) {
  switch (msg.type) {
    case 'SET_VALUES':
      return { ...state, values: msg.payload };
    case 'SET_TOUCHED':
      return { ...state, touched: msg.payload };
    case 'SET_ERRORS':
      if (isEqual(state.errors, msg.payload)) {
        return state;
      }

      return { ...state, errors: msg.payload };
    case 'SET_STATUS':
      return { ...state, status: msg.payload };
    case 'SET_ISSUBMITTING':
      return { ...state, isSubmitting: msg.payload };
    case 'SET_ISVALIDATING':
      return { ...state, isValidating: msg.payload };
    case 'SET_FIELD_VALUE':
      return {
        ...state,
        values: setIn(state.values, msg.payload.field, msg.payload.value),
      };
    case 'SET_FIELD_TOUCHED':
      return {
        ...state,
        touched: setIn(state.touched, msg.payload.field, msg.payload.value),
      };
    case 'SET_FIELD_ERROR':
      return {
        ...state,
        errors: setIn(state.errors, msg.payload.field, msg.payload.value),
      };
    case 'RESET_FORM':
      return { ...state, ...msg.payload };
    case 'SET_FORMIK_STATE':
      return msg.payload(state);
    case 'SUBMIT_ATTEMPT':
      return {
        ...state,
        touched: setNestedObjectValues<FormikTouched<Values>>(
          state.values,
          true
        ),
        isSubmitting: true,
        submitCount: state.submitCount + 1,
      };
    case 'SUBMIT_FAILURE':
      return {
        ...state,
        isSubmitting: false,
      };
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        isSubmitting: false,
      };
    default:
      return state;
  }
}

export function useFormik<Values extends FormikValues = FormikValues>(
  rawProps: FormikConfig<Values>
): FormikApi<Values> & FormikSharedConfig<Values> {
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

  /**
   * Refs
   */
  const isMounted = React.useRef<boolean>(false);
  const fieldRegistry = React.useRef<FieldRegistry>({});

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

  const emptyErrors: FormikErrors<unknown> = {};
  const emptyTouched: FormikTouched<unknown> = {};

  const isFormValid = React.useCallback<IsFormValidFn<Values>>(
   (errors, dirty) => {
     return typeof props.isInitialValid !== 'undefined'
       ? dirty
         ? errors && Object.keys(errors).length === 0
         : props.isInitialValid !== false && isFunction(props.isInitialValid)
         ? props.isInitialValid(props)
         : props.isInitialValid
       : errors && Object.keys(errors).length === 0;
   },
   [props]
 );

  /**
   * `useState` is a special hook intended for other components and hooks.
   * `getState` is used to get state imperatively.
   * `dispatch` is used to update Formik's state.
   */
  const {
    useState,
    getState,
    dispatch
  } = useFormikSubscriptions(
    {
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
    },
    formikReducer,
    isFormValid,
  );

  React.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const runValidateHandler = React.useCallback(
    (values: Values): Promise<FormikErrors<Values>> => {
      return new Promise((resolve, reject) => {
        const maybePromisedErrors = props.validate?.(values);
        if (maybePromisedErrors == null) {
          // use loose null check here on purpose
          resolve(emptyErrors);
        } else if (isPromise(maybePromisedErrors)) {
          (maybePromisedErrors as Promise<any>).then(
            errors => {
              resolve(errors || emptyErrors);
            },
            actualException => {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `Warning: An unhandled error was caught during validation in <Formik validate />`,
                  actualException
                );
              }

              reject(actualException);
            }
          );
        } else {
          resolve(maybePromisedErrors);
        }
      });
    },
    [props.validate]
  );

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  const runValidationSchema = React.useCallback(
    (values: Values, field?: string): Promise<FormikErrors<Values>> => {
      const validationSchema = props.validationSchema;
      const schema = isFunction(validationSchema)
        ? validationSchema(field)
        : validationSchema;
      const promise =
        field && schema.validateAt
          ? schema.validateAt(field, values)
          : validateYupSchema(values, schema);
      return new Promise((resolve, reject) => {
        promise.then(
          () => {
            resolve(emptyErrors);
          },
          (err: any) => {
            // Yup will throw a validation error if validation fails. We catch those and
            // resolve them into Formik errors. We can sniff if something is a Yup error
            // by checking error.name.
            // @see https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string
            if (err.name === 'ValidationError') {
              resolve(yupToFormErrors(err));
            } else {
              // We throw any other errors
              if (process.env.NODE_ENV !== 'production') {
                console.warn(
                  `Warning: An unhandled error was caught during validation in <Formik validationSchema />`,
                  err
                );
              }

              reject(err);
            }
          }
        );
      });
    },
    [props.validationSchema]
  );

  const runSingleFieldLevelValidation = React.useCallback(
    (field: string, value: void | string): Promise<string> => {
      return new Promise(resolve =>
        resolve(fieldRegistry.current[field].validate(value) as string)
      );
    },
    []
  );

  const runFieldLevelValidations = React.useCallback(
    (values: Values): Promise<FormikErrors<Values>> => {
      const fieldKeysWithValidation: string[] = Object.keys(
        fieldRegistry.current
      ).filter(f => isFunction(fieldRegistry.current[f].validate));

      // Construct an array with all of the field validation functions
      const fieldValidations: Promise<string>[] =
        fieldKeysWithValidation.length > 0
          ? fieldKeysWithValidation.map(f =>
              runSingleFieldLevelValidation(f, getIn(values, f))
            )
          : [Promise.resolve('DO_NOT_DELETE_YOU_WILL_BE_FIRED')]; // use special case ;)

      return Promise.all(fieldValidations).then((fieldErrorsList: string[]) =>
        fieldErrorsList.reduce((prev, curr, index) => {
          if (curr === 'DO_NOT_DELETE_YOU_WILL_BE_FIRED') {
            return prev;
          }
          if (curr) {
            prev = setIn(prev, fieldKeysWithValidation[index], curr);
          }
          return prev;
        }, {})
      );
    },
    [runSingleFieldLevelValidation]
  );

  // Run all validations and return the result
  const runAllValidations = React.useCallback(
    (values: Values) => {
      return Promise.all([
        runFieldLevelValidations(values),
        props.validationSchema ? runValidationSchema(values) : {},
        props.validate ? runValidateHandler(values) : {},
      ]).then(([fieldErrors, schemaErrors, validateErrors]) => {
        const combinedErrors = deepmerge.all<FormikErrors<Values>>(
          [fieldErrors, schemaErrors, validateErrors],
          { arrayMerge }
        );
        return combinedErrors;
      });
    },
    [
      props.validate,
      props.validationSchema,
      runFieldLevelValidations,
      runValidateHandler,
      runValidationSchema,
    ]
  );

  // Run all validations methods and update state accordingly
  const validateFormWithHighPriority = useEventCallback(
    (values: Values = getState().values) => {
      dispatch({ type: 'SET_ISVALIDATING', payload: true });
      return runAllValidations(values).then(combinedErrors => {
        if (!!isMounted.current) {
          dispatch({ type: 'SET_ISVALIDATING', payload: false });
          dispatch({ type: 'SET_ERRORS', payload: combinedErrors });
        }
        return combinedErrors;
      });
    }
  );

  const performValidationOnMount = useEventCallback(() => {
    if (
      validateOnMount &&
      isMounted.current === true &&
      isEqual(getState().initialValues, props.initialValues)
    ) {
      validateFormWithHighPriority(getState().initialValues);
    }
  });

  React.useEffect(() => {
    performValidationOnMount();
  }, [performValidationOnMount]);

  const resetForm = useEventCallback(
    (nextState?: Partial<FormikReducerState<Values>>) => {
      const values =
        nextState?.values ?? nextState?.initialValues ?? getState().initialValues;
      const errors =
        nextState?.errors ??
        nextState?.initialErrors ??
        getState()?.initialErrors ??
        props.initialErrors ??
        {};
      const touched =
        nextState?.touched ??
        nextState?.initialTouched ??
        getState().initialTouched ??
        props.initialTouched ??
        {};
      const status =
        nextState?.status ??
        nextState?.initialStatus ??
        getState().initialStatus ??
        props.initialStatus;

      const dispatchFn = () => {
        dispatch({
          type: 'RESET_FORM',
          payload: {
            isSubmitting: !!nextState && !!nextState.isSubmitting,
            initialErrors: errors,
            errors,
            initialTouched: touched,
            touched,
            initialStatus: status,
            status,
            initialValues: values,
            values,
            isValidating: !!nextState && !!nextState.isValidating,
            submitCount:
              !!nextState &&
              !!nextState.submitCount &&
              typeof nextState.submitCount === 'number'
                ? nextState.submitCount
                : 0,
          },
        });
      };

      if (props.onReset) {
        const maybePromisedOnReset = (props.onReset as any)(
          getState().values,
          imperativeMethods
        );

        if (isPromise(maybePromisedOnReset)) {
          (maybePromisedOnReset as Promise<any>).then(dispatchFn);
        } else {
          dispatchFn();
        }
      } else {
        dispatchFn();
      }
    }
  );

  const maybeUpdateInitialValues = useEventCallback(
    (
      nextInitialValuesProp: FormikConfig<Values>['initialValues'],
      nextEnableReinitialize: FormikConfig<Values>['enableReinitialize'],
      nextValidateOnMount: FormikConfig<Values>['validateOnMount']
    ) => {
      if (
        isMounted.current === true &&
        !isEqual(getState().initialValues, nextInitialValuesProp)
      ) {
        if (nextEnableReinitialize) {
          resetForm({ initialValues: nextInitialValuesProp });
        }

        if (nextValidateOnMount) {
          validateFormWithHighPriority(getState().initialValues);
        }
      }
    }
  );

  React.useEffect(() => {
    maybeUpdateInitialValues(
      props.initialValues,
      enableReinitialize,
      validateOnMount
    );
  }, [
    maybeUpdateInitialValues,
    enableReinitialize,
    props.initialValues,
    validateOnMount,
  ]);

  const maybeUpdateInitialErrors = useEventCallback(
    (
      nextInitialErrorsProp: FormikConfig<Values>['initialErrors'],
      nextEnableReinitialize: FormikConfig<Values>['enableReinitialize']
    ) => {
      if (
        nextEnableReinitialize &&
        isMounted.current === true &&
        !isEqual(getState().initialErrors, nextInitialErrorsProp)
      ) {
        const errors = nextInitialErrorsProp ?? emptyErrors;

        dispatch({
          type: 'RESET_FORM',
          payload: {
            initialErrors: errors,
            errors,
          },
        });
      }
    }
  );

  React.useEffect(() => {
    maybeUpdateInitialErrors(props.initialErrors, enableReinitialize);
  }, [maybeUpdateInitialErrors, props.initialErrors, enableReinitialize]);

  const maybeUpdateInitialTouched = useEventCallback(
    (
      nextInitialTouchedProp: FormikConfig<Values>['initialTouched'],
      nextEnableReinitialize: FormikConfig<Values>['enableReinitialize']
    ) => {
      if (
        nextEnableReinitialize &&
        isMounted.current === true &&
        !isEqual(getState().initialTouched, nextInitialTouchedProp)
      ) {
        const touched = nextInitialTouchedProp ?? emptyTouched;

        dispatch({
          type: 'RESET_FORM',
          payload: {
            initialTouched: touched,
            touched,
          },
        });
      }
    }
  );

  React.useEffect(() => {
    maybeUpdateInitialTouched(props.initialTouched, enableReinitialize);
  }, [maybeUpdateInitialTouched, enableReinitialize, props.initialTouched]);

  const maybeUpdateInitialStatus = useEventCallback(
    (
      nextInitialStatusProp: FormikConfig<Values>['initialStatus'],
      nextEnableReinitialize: FormikConfig<Values>['enableReinitialize']
    ) => {
      if (
        nextEnableReinitialize &&
        isMounted.current === true &&
        !isEqual(getState().initialStatus, nextInitialStatusProp)
      ) {
        const status = nextInitialStatusProp;

        dispatch({
          type: 'RESET_FORM',
          payload: {
            initialStatus: status,
            status,
          },
        });
      }
    }
  );

  React.useEffect(() => {
    maybeUpdateInitialStatus(props.initialStatus, enableReinitialize);
  }, [maybeUpdateInitialStatus, enableReinitialize, props.initialStatus]);

  const validateField = useEventCallback((name: string) => {
    // This will efficiently validate a single field by avoiding state
    // changes if the validation function is synchronous. It's different from
    // what is called when using validateForm.

    if (
      fieldRegistry.current[name] &&
      isFunction(fieldRegistry.current[name].validate)
    ) {
      const value = getIn(getState().values, name);
      const maybePromise = fieldRegistry.current[name].validate(value);
      if (isPromise(maybePromise)) {
        // Only flip isValidating if the function is async.
        dispatch({ type: 'SET_ISVALIDATING', payload: true });
        return maybePromise
          .then((x: any) => x)
          .then((error: string) => {
            dispatch({
              type: 'SET_FIELD_ERROR',
              payload: { field: name, value: error },
            });
            dispatch({ type: 'SET_ISVALIDATING', payload: false });
          });
      } else {
        dispatch({
          type: 'SET_FIELD_ERROR',
          payload: {
            field: name,
            value: maybePromise as string | undefined,
          },
        });
        return Promise.resolve(maybePromise as string | undefined);
      }
    } else if (props.validationSchema) {
      dispatch({ type: 'SET_ISVALIDATING', payload: true });
      return runValidationSchema(getState().values, name)
        .then((x: any) => x)
        .then((error: any) => {
          dispatch({
            type: 'SET_FIELD_ERROR',
            payload: { field: name, value: error[name] },
          });
          dispatch({ type: 'SET_ISVALIDATING', payload: false });
        });
    }

    return Promise.resolve();
  });

  const registerField = React.useCallback((name: string, { validate }: any) => {
    fieldRegistry.current[name] = {
      validate,
    };
  }, []);

  const unregisterField = React.useCallback((name: string) => {
    delete fieldRegistry.current[name];
  }, []);

  const setTouched = useEventCallback(
    (touched: FormikTouched<Values>, shouldValidate?: boolean) => {
      dispatch({ type: 'SET_TOUCHED', payload: touched });
      const willValidate =
        shouldValidate === undefined ? validateOnBlur : shouldValidate;
      return willValidate
        ? validateFormWithHighPriority(getState().values)
        : Promise.resolve();
    }
  );

  const setErrors = React.useCallback(
    (errors: FormikErrors<Values>) => {
      dispatch({ type: 'SET_ERRORS', payload: errors });
    },
    [dispatch]
  );

  const setValues = useEventCallback(
    (values: React.SetStateAction<Values>, shouldValidate?: boolean) => {
      const resolvedValues = isFunction(values) ? values(getState().values) : values;

      dispatch({ type: 'SET_VALUES', payload: resolvedValues });
      const willValidate =
        shouldValidate === undefined ? validateOnChange : shouldValidate;
      return willValidate
        ? validateFormWithHighPriority(resolvedValues)
        : Promise.resolve();
    }
  );

  const setFieldError = React.useCallback(
    (field: string, value: string | undefined) => {
      dispatch({
        type: 'SET_FIELD_ERROR',
        payload: { field, value },
      });
    },
    [dispatch]
  );

  const setFieldValue = useEventCallback(
    (field: string, value: any, shouldValidate?: boolean) => {
      dispatch({
        type: 'SET_FIELD_VALUE',
        payload: {
          field,
          value,
        },
      });
      const willValidate =
        shouldValidate === undefined ? validateOnChange : shouldValidate;
      return willValidate
        ? validateFormWithHighPriority(setIn(getState().values, field, value))
        : Promise.resolve();
    }
  );

  const executeChange = React.useCallback(
    (eventOrTextValue: string | React.ChangeEvent<React.ElementRef<InputElements>>, maybePath?: string) => {
      // By default, assume that the first argument is a string. This allows us to use
      // handleChange with React Native and React Native Web's onChangeText prop which
      // provides just the value of the input.
      let field = maybePath;

      // If the first argument is not a string though, it has to be a synthetic React Event (or a fake one),
      // so we handle like we would a normal HTML change event.
      if (!isString(eventOrTextValue)) {
        // If we can, persist the event
        // @see https://reactjs.org/docs/events.html#event-pooling
        //
        // but first, check if someone might have faked this value
        if (typeof eventOrTextValue.persist !== "undefined") {
          eventOrTextValue.persist();
        }

        const target = eventOrTextValue.target
          ? eventOrTextValue.target
          : eventOrTextValue.currentTarget;

        const {
          name,
          id,
          outerHTML,
        } = target;

        field = maybePath ? maybePath : name ? name : id;

        if (!field && __DEV__) {
          warnAboutMissingIdentifier({
            htmlContent: outerHTML,
            documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
            handlerName: 'handleChange',
          });
        }

        selectFieldOnChange({ setFieldValue, getState })(eventOrTextValue);

      } else if (field) {
        selectFieldOnChange({ setFieldValue, getState }, field)(eventOrTextValue);
      }
    },
    [setFieldValue]
  );

  const handleChange = useEventCallback(
    (
      eventOrPath: string | React.ChangeEvent<any>
    ): HandleChangeEventFn | void => {
      if (isString(eventOrPath)) {
        return (event: string | React.ChangeEvent<any>) =>
          executeChange(event, eventOrPath);
      } else {
        return executeChange(eventOrPath);
      }
    }
  ) as HandleChangeFn;

  const setFieldTouched = useEventCallback(
    (field: string, touched: boolean = true, shouldValidate?: boolean) => {
      dispatch({
        type: 'SET_FIELD_TOUCHED',
        payload: {
          field,
          value: touched,
        },
      });
      const willValidate =
        shouldValidate === undefined ? validateOnBlur : shouldValidate;
      return willValidate
        ? validateFormWithHighPriority(getState().values)
        : Promise.resolve();
    }
  );

  const executeBlur = React.useCallback(
    (e: any, path?: string) => {
      if (e.persist) {
        e.persist();
      }
      const { name, id, outerHTML } = e.target;
      const field = path ? path : name ? name : id;

      if (!field && __DEV__) {
        warnAboutMissingIdentifier({
          htmlContent: outerHTML,
          documentationAnchorLink: 'handleblur-e-any--void',
          handlerName: 'handleBlur',
        });
      }

      setFieldTouched(field, true);
    },
    [setFieldTouched]
  );

  /**
   * TypeScript doesn't currently allow you to infer overloads from a Type.
   *
   * Instead, we make sure this function returns any possibility of HandleBlurFn,
   * and then cast it.
   */
  const handleBlur = useEventCallback(
    (eventOrPath: string | React.FocusEvent<any>): HandleBlurEventFn | void => {
      if (isString(eventOrPath)) {
        return (event: React.FocusEvent<any>) =>
          executeBlur(event, eventOrPath);
      } else {
        return executeBlur(eventOrPath);
      }
    }
  ) as HandleBlurFn;

  const setFormikState = React.useCallback(
    (
      stateOrCb:
        | FormikReducerState<Values>
        | ((state: FormikReducerState<Values>) => FormikReducerState<Values>)
    ): void => {
      if (isFunction(stateOrCb)) {
        dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb });
      } else {
        dispatch({ type: 'SET_FORMIK_STATE', payload: () => stateOrCb });
      }
    },
    [dispatch]
  );

  const setStatus = React.useCallback(
    (status: any) => {
      dispatch({ type: 'SET_STATUS', payload: status });
    },
    [dispatch]
  );

  const setSubmitting = React.useCallback(
    (isSubmitting: boolean) => {
      dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting });
    },
    [dispatch]
  );

  const submitForm = useEventCallback(() => {
    dispatch({ type: 'SUBMIT_ATTEMPT' });
    return validateFormWithHighPriority().then(
      (combinedErrors: FormikErrors<Values>) => {
        // In case an error was thrown and passed to the resolved Promise,
        // `combinedErrors` can be an instance of an Error. We need to check
        // that and abort the submit.
        // If we don't do that, calling `Object.keys(new Error())` yields an
        // empty array, which causes the validation to pass and the form
        // to be submitted.

        const isInstanceOfError = combinedErrors instanceof Error;
        const isActuallyValid =
          !isInstanceOfError && Object.keys(combinedErrors).length === 0;
        if (isActuallyValid) {
          // Proceed with submit...
          //
          // To respect sync submit fns, we can't simply wrap executeSubmit in a promise and
          // _always_ dispatch SUBMIT_SUCCESS because isSubmitting would then always be false.
          // This would be fine in simple cases, but make it impossible to disable submit
          // buttons where people use callbacks or promises as side effects (which is basically
          // all of v1 Formik code). Instead, recall that we are inside of a promise chain already,
          //  so we can try/catch executeSubmit(), if it returns undefined, then just bail.
          // If there are errors, throw em. Otherwise, wrap executeSubmit in a promise and handle
          // cleanup of isSubmitting on behalf of the consumer.
          let promiseOrUndefined;
          try {
            promiseOrUndefined = executeSubmit();
            // Bail if it's sync, consumer is responsible for cleaning up
            // via setSubmitting(false)
            if (promiseOrUndefined === undefined) {
              return;
            }
          } catch (error) {
            throw error;
          }

          return Promise.resolve(promiseOrUndefined)
            .then(result => {
              if (!!isMounted.current) {
                dispatch({ type: 'SUBMIT_SUCCESS' });
              }
              return result;
            })
            .catch(_errors => {
              if (!!isMounted.current) {
                dispatch({ type: 'SUBMIT_FAILURE' });
                // This is a legit error rejected by the onSubmit fn
                // so we don't want to break the promise chain
                throw _errors;
              }
            });
        } else if (!!isMounted.current) {
          // ^^^ Make sure Formik is still mounted before updating state
          dispatch({ type: 'SUBMIT_FAILURE' });
          // throw combinedErrors;
          if (isInstanceOfError) {
            throw combinedErrors;
          }
        }
        return;
      }
    );
  });

  const handleSubmit = useEventCallback(
    (e?: React.FormEvent<HTMLFormElement>) => {
      if (e && e.preventDefault && isFunction(e.preventDefault)) {
        e.preventDefault();
      }

      if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
        e.stopPropagation();
      }

      // Warn if form submission is triggered by a <button> without a
      // specified `type` attribute during development. This mitigates
      // a common gotcha in forms with both reset and submit buttons,
      // where the dev forgets to add type="button" to the reset button.
      if (__DEV__ && typeof document !== 'undefined') {
        // Safely get the active element (works with IE)
        const activeElement = getActiveElement();
        if (
          activeElement !== null &&
          activeElement instanceof HTMLButtonElement
        ) {
          invariant(
            activeElement.attributes &&
              activeElement.attributes.getNamedItem('type'),
            'You submitted a Formik form using a button with an unspecified `type` attribute.  Most browsers default button elements to `type="submit"`. If this is not a submit button, please add `type="button"`.'
          );
        }
      }

      submitForm().catch(reason => {
        console.warn(
          `Warning: An unhandled error was caught from submitForm()`,
          reason
        );
      });
    }
  );

  const imperativeMethods: FormikHelpers<Values> = {
    resetForm,
    validateForm: validateFormWithHighPriority,
    validateField,
    setErrors,
    setFieldError,
    setFieldTouched,
    setFieldValue,
    setStatus,
    setSubmitting,
    setTouched,
    setValues,
    setFormikState,
    submitForm,
  };

  const executeSubmit = useEventCallback(() => {
    return props.onSubmit(getState().values, imperativeMethods);
  });

  const handleReset = useEventCallback(e => {
    if (e && e.preventDefault && isFunction(e.preventDefault)) {
      e.preventDefault();
    }

    if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
      e.stopPropagation();
    }

    resetForm();
  });

  // mostly optimized renders
  return {
      // config
      enableReinitialize,
      isInitialValid: props.isInitialValid,
      validateOnBlur,
      validateOnChange,
      validateOnMount,
      validationSchema: props.validationSchema,
      validate: props.validate,
      // handlers
      handleBlur,
      handleChange,
      handleReset,
      handleSubmit,
      // helpers
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
      validateForm: validateFormWithHighPriority,
      validateField,
      unregisterField,
      registerField,
      // state helpers
      getState,
      useState,
  };
}

export function Formik<
  Values extends FormikValues = FormikValues,
  ExtraProps = {}
>(props: FormikConfig<Values> & ExtraProps) {
  const formik = useFormik<Values>(props);
  const { component, children, render, innerRef } = props;

  // Get initial Full State, but if we don't need it, we won't subscribe to updates
  const formikState = formik.useState(
    selectFullState,
    Object.is,
    !!component || !!render || isFunction(children) || !!innerRef
  );

  const formikbag: FormikProps<Values> = {
    ...formik,
    ...formikState,
  };

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
    <FormikProvider value={formik}>
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

function warnAboutMissingIdentifier({
  htmlContent,
  documentationAnchorLink,
  handlerName,
}: {
  htmlContent: string;
  documentationAnchorLink: string;
  handlerName: string;
}) {
  console.warn(
    `Warning: Formik called \`${handlerName}\`, but you forgot to pass an \`id\` or \`name\` attribute to your input:
    ${htmlContent}
    Formik cannot determine which value to update. For more info see https://formik.org/docs/api/formik#${documentationAnchorLink}
  `
  );
}

/**
 * Transform Yup ValidationError to a more usable object
 */
export function yupToFormErrors<Values>(yupError: any): FormikErrors<Values> {
  let errors: FormikErrors<Values> = {};
  if (yupError.inner) {
    if (yupError.inner.length === 0) {
      return setIn(errors, yupError.path, yupError.message);
    }
    for (let err of yupError.inner) {
      if (!getIn(errors, err.path)) {
        errors = setIn(errors, err.path, err.message);
      }
    }
  }
  return errors;
}

/**
 * Validate a yup schema.
 */
export function validateYupSchema<T extends FormikValues>(
  values: T,
  schema: any,
  sync: boolean = false,
  context: any = {}
): Promise<Partial<T>> {
  const validateData: FormikValues = prepareDataForValidation(values);
  return schema[sync ? 'validateSync' : 'validate'](validateData, {
    abortEarly: false,
    context: context,
  });
}

/**
 * Recursively prepare values.
 */
export function prepareDataForValidation<T extends FormikValues>(
  values: T
): FormikValues {
  let data: FormikValues = Array.isArray(values) ? [] : {};
  for (let k in values) {
    if (Object.prototype.hasOwnProperty.call(values, k)) {
      const key = String(k);
      if (Array.isArray(values[key]) === true) {
        data[key] = values[key].map((value: any) => {
          if (Array.isArray(value) === true || isPlainObject(value)) {
            return prepareDataForValidation(value);
          } else {
            return value !== '' ? value : undefined;
          }
        });
      } else if (isPlainObject(values[key])) {
        data[key] = prepareDataForValidation(values[key]);
      } else {
        data[key] = values[key] !== '' ? values[key] : undefined;
      }
    }
  }
  return data;
}

/**
 * deepmerge array merging algorithm
 * https://github.com/KyleAMathews/deepmerge#combine-array
 */
function arrayMerge(target: any[], source: any[], options: any): any[] {
  const destination = target.slice();

  source.forEach(function merge(e: any, i: number) {
    if (typeof destination[i] === 'undefined') {
      const cloneRequested = options.clone !== false;
      const shouldClone = cloneRequested && options.isMergeableObject(e);
      destination[i] = shouldClone
        ? deepmerge(Array.isArray(e) ? [] : {}, e, options)
        : e;
    } else if (options.isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, options);
    } else if (target.indexOf(e) === -1) {
      destination.push(e);
    }
  });
  return destination;
}
