import * as React from 'react';
import isEqual from 'react-fast-compare';
import deepmerge from 'deepmerge';
import isPlainObject from 'lodash/isPlainObject';
import {
  FormikConfig,
  FormikErrors,
  FormikState,
  FormikTouched,
  FormikValues,
  FormikProps,
  FieldMetaProps,
  FieldInputProps,
} from './types';
import {
  isFunction,
  isString,
  setIn,
  isEmptyChildren,
  isPromise,
  setNestedObjectValues,
  getActiveElement,
  getIn,
  isObject,
} from './utils';
import { FormikProvider } from './FormikContext';
import invariant from 'tiny-warning';
import { LowPriority, unstable_runWithPriority } from 'scheduler';

type FormikMessage<Values> =
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'SUBMIT_FAILURE' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SET_ISVALIDATING'; payload: boolean }
  | { type: 'SET_ISSUBMITTING'; payload: boolean }
  | { type: 'SET_VALUES'; payload: Values }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value?: any } }
  | { type: 'SET_FIELD_TOUCHED'; payload: { field: string; value?: boolean } }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; value?: string } }
  | { type: 'SET_TOUCHED'; payload: FormikTouched<Values> }
  | { type: 'SET_ERRORS'; payload: FormikErrors<Values> }
  | { type: 'SET_STATUS'; payload: any }
  | {
      type: 'SET_FORMIK_STATE';
      payload: (s: FormikState<Values>) => FormikState<Values>;
    }
  | {
      type: 'RESET_FORM';
      payload: FormikState<Values>;
    };

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

// Initial empty states // objects
const emptyErrors: FormikErrors<unknown> = {};
const emptyTouched: FormikTouched<unknown> = {};

// This is an object that contains a map of all registered fields
// and their validate functions
interface FieldRegistry {
  [field: string]: {
    validate: (value: any) => string | Promise<string> | undefined;
  };
}

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
  const initialValues = React.useRef(props.initialValues);
  const initialErrors = React.useRef(props.initialErrors || emptyErrors);
  const initialTouched = React.useRef(props.initialTouched || emptyTouched);
  const initialStatus = React.useRef(props.initialStatus);
  const isMounted = React.useRef<boolean>(false);
  const fieldRegistry = React.useRef<FieldRegistry>({});
  React.useEffect(() => {
    if (__DEV__) {
      invariant(
        typeof isInitialValid === 'undefined',
        'isInitialValid has been deprecated and will be removed in future versions of Formik. Please use initialErrors or validateOnMount instead.'
      );
    }
    // eslint-disable-next-line
  }, []);

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

  const runValidateHandler = React.useCallback(
    (values: Values, field?: string): Promise<FormikErrors<Values>> => {
      return new Promise((resolve, reject) => {
        const maybePromisedErrors = (props.validate as any)(values, field);
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
            // resolve them into Formik errors. We can sniff is something is a Yup error
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
        resolve(fieldRegistry.current[field].validate(value))
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

  // Run validations and dispatching the result as low-priority via rAF.
  //
  // The thinking is that validation as a result of onChange and onBlur
  // should never block user input. Note: This method should never be called
  // during the submission phase because validation prior to submission
  // is actaully high-priority since we absolutely need to guarantee the
  // form is valid before executing props.onSubmit.
  const validateFormWithLowPriority = useEventCallback(
    (values: Values = state.values) => {
      return unstable_runWithPriority(LowPriority, () => {
        return runAllValidations(values).then(combinedErrors => {
          if (!!isMounted.current) {
            dispatch({ type: 'SET_ERRORS', payload: combinedErrors });
          }
          return combinedErrors;
        });
      });
    }
  );

  // Run all validations methods and update state accordingly
  const validateFormWithHighPriority = useEventCallback(
    (values: Values = state.values) => {
      dispatch({ type: 'SET_ISVALIDATING', payload: true });
      return runAllValidations(values).then(combinedErrors => {
        if (!!isMounted.current) {
          dispatch({ type: 'SET_ISVALIDATING', payload: false });
          if (!isEqual(state.errors, combinedErrors)) {
            dispatch({ type: 'SET_ERRORS', payload: combinedErrors });
          }
        }
        return combinedErrors;
      });
    }
  );

  React.useEffect(() => {
    if (validateOnMount && isMounted.current === true) {
      validateFormWithLowPriority(props.initialValues);
    }
  }, [props.initialValues, validateOnMount, validateFormWithLowPriority]);

  const resetForm = React.useCallback(
    (nextState?: Partial<FormikState<Values>>) => {
      const values =
        nextState && nextState.values
          ? nextState.values
          : initialValues.current;
      const errors =
        nextState && nextState.errors
          ? nextState.errors
          : initialErrors.current
          ? initialErrors.current
          : props.initialErrors || {};
      const touched =
        nextState && nextState.touched
          ? nextState.touched
          : initialTouched.current
          ? initialTouched.current
          : props.initialTouched || {};
      const status =
        nextState && nextState.status
          ? nextState.status
          : initialStatus.current
          ? initialStatus.current
          : props.initialStatus;
      initialValues.current = values;
      initialErrors.current = errors;
      initialTouched.current = touched;
      initialStatus.current = status;

      dispatch({
        type: 'RESET_FORM',
        payload: {
          isSubmitting: !!nextState && !!nextState.isSubmitting,
          errors,
          touched,
          status,
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
    },
    [props.initialErrors, props.initialStatus, props.initialTouched]
  );

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialValues.current, props.initialValues)
    ) {
      initialValues.current = props.initialValues;
      resetForm();
    }
  }, [enableReinitialize, props.initialValues, resetForm]);

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

  const validateField = useEventCallback((name: string) => {
    // This will efficiently validate a single field by avoiding state
    // changes if the validation function is synchronous. It's different from
    // what is called when using validateForm.

    if (isFunction(fieldRegistry.current[name].validate)) {
      const value = getIn(state.values, name);
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
    } else {
      return Promise.resolve();
    }
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
        ? validateFormWithLowPriority(state.values)
        : Promise.resolve();
    }
  );

  const setErrors = React.useCallback((errors: FormikErrors<Values>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const setValues = useEventCallback(
    (values: Values, shouldValidate?: boolean) => {
      dispatch({ type: 'SET_VALUES', payload: values });
      const willValidate =
        shouldValidate === undefined ? validateOnChange : shouldValidate;
      return willValidate
        ? validateFormWithLowPriority(values)
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
    []
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
        ? validateFormWithLowPriority(setIn(state.values, field, value))
        : Promise.resolve();
    }
  );

  const executeChange = React.useCallback(
    (eventOrTextValue: string | React.ChangeEvent<any>, maybePath?: string) => {
      // By default, assume that the first argument is a string. This allows us to use
      // handleChange with React Native and React Native Web's onChangeText prop which
      // provides just the value of the input.
      let field = maybePath;
      let val = eventOrTextValue;
      let parsed;
      // If the first argument is not a string though, it has to be a synthetic React Event (or a fake one),
      // so we handle like we would a normal HTML change event.
      if (!isString(eventOrTextValue)) {
        // If we can, persist the event
        // @see https://reactjs.org/docs/events.html#event-pooling
        if ((eventOrTextValue as React.ChangeEvent<any>).persist) {
          (eventOrTextValue as React.ChangeEvent<any>).persist();
        }
        const target = eventOrTextValue.target
          ? (eventOrTextValue as React.ChangeEvent<any>).target
          : (eventOrTextValue as React.ChangeEvent<any>).currentTarget;

        const {
          type,
          name,
          id,
          value,
          checked,
          outerHTML,
          options,
          multiple,
        } = target;

        field = maybePath ? maybePath : name ? name : id;
        if (!field && __DEV__) {
          warnAboutMissingIdentifier({
            htmlContent: outerHTML,
            documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
            handlerName: 'handleChange',
          });
        }
        val = /number|range/.test(type)
          ? ((parsed = parseFloat(value)), isNaN(parsed) ? '' : parsed)
          : /checkbox/.test(type) // checkboxes
          ? getValueForCheckbox(getIn(state.values, field!), checked, value)
          : !!multiple // <select multiple>
          ? getSelectedValues(options)
          : value;
      }

      if (field) {
        // Set form fields by name
        setFieldValue(field, val);
      }
    },
    [setFieldValue, state.values]
  );

  const handleChange = React.useCallback(
    (
      eventOrPath: string | React.ChangeEvent<any>
    ): void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void) => {
      if (isString(eventOrPath)) {
        return event => executeChange(event, eventOrPath);
      } else {
        executeChange(eventOrPath);
      }
    },
    [executeChange]
  );

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
        ? validateFormWithLowPriority(state.values)
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

  const handleBlur = React.useCallback(
    (eventOrString: any): void | ((e: any) => void) => {
      if (isString(eventOrString)) {
        return event => executeBlur(event, eventOrString);
      } else {
        executeBlur(eventOrString);
      }
    },
    [executeBlur]
  );

  const setFormikState = React.useCallback(
    (
      stateOrCb:
        | FormikState<Values>
        | ((state: FormikState<Values>) => FormikState<Values>)
    ): void => {
      if (isFunction(stateOrCb)) {
        dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb });
      } else {
        dispatch({ type: 'SET_FORMIK_STATE', payload: () => stateOrCb });
      }
    },
    []
  );

  const setStatus = React.useCallback((status: any) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  }, []);

  const setSubmitting = React.useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting });
  }, []);

  const imperativeMethods = {
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
  };

  const executeSubmit = useEventCallback(() => {
    return onSubmit(state.values, imperativeMethods);
  });

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
            .then(() => {
              if (!!isMounted.current) {
                dispatch({ type: 'SUBMIT_SUCCESS' });
              }
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

      submitForm();
    }
  );
  const handleReset = useEventCallback(e => {
    if (e && e.preventDefault && isFunction(e.preventDefault)) {
      e.preventDefault();
    }

    if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
      e.stopPropagation();
    }

    if (props.onReset) {
      const maybePromisedOnReset = (props.onReset as any)(
        state.values,
        imperativeMethods
      );

      if (isPromise(maybePromisedOnReset)) {
        (maybePromisedOnReset as Promise<any>).then(resetForm);
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  });

  const getFieldMeta = React.useCallback(
    (name: string): FieldMetaProps<any> => {
      return {
        value: getIn(state.values, name),
        error: getIn(state.errors, name),
        touched: !!getIn(state.touched, name),
        initialValue: getIn(initialValues.current, name),
        initialTouched: !!getIn(initialTouched.current, name),
        initialError: getIn(initialErrors.current, name),
      };
    },
    [state.errors, state.touched, state.values]
  );

  const getFieldProps = React.useCallback(
    (nameOrOptions): FieldInputProps<any> => {
      const isAnObject = isObject(nameOrOptions);
      const name = isAnObject ? nameOrOptions.name : nameOrOptions;
      const valueState = getIn(state.values, name);

      const field: FieldInputProps<any> = {
        name,
        value: valueState,
        onChange: handleChange,
        onBlur: handleBlur,
      };
      if (isAnObject) {
        const {
          type,
          value: valueProp, // value is special for checkboxes
          as: is,
          multiple,
        } = nameOrOptions;

        if (type === 'checkbox') {
          if (valueProp === undefined) {
            field.checked = !!valueState;
          } else {
            field.checked = !!(
              Array.isArray(valueState) && ~valueState.indexOf(valueProp)
            );
            field.value = valueProp;
          }
        } else if (type === 'radio') {
          field.checked = valueState === valueProp;
          field.value = valueProp;
        } else if (is === 'select' && multiple) {
          field.value = field.value || [];
          field.multiple = true;
        }
      }
      return field;
    },
    [handleBlur, handleChange, state.values]
  );

  const dirty = React.useMemo(
    () => !isEqual(initialValues.current, state.values),
    [initialValues.current, state.values]
  );

  const isValid = React.useMemo(
    () =>
      typeof isInitialValid !== 'undefined'
        ? dirty
          ? state.errors && Object.keys(state.errors).length === 0
          : isInitialValid !== false && isFunction(isInitialValid)
          ? (isInitialValid as (props: FormikConfig<Values>) => boolean)(props)
          : (isInitialValid as boolean)
        : state.errors && Object.keys(state.errors).length === 0,
    [isInitialValid, dirty, state.errors, props]
  );

  const ctx = {
    ...state,
    initialValues: initialValues.current,
    initialErrors: initialErrors.current,
    initialTouched: initialTouched.current,
    initialStatus: initialStatus.current,
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
    validateForm: validateFormWithHighPriority,
    validateField,
    isValid,
    dirty,
    unregisterField,
    registerField,
    getFieldProps,
    getFieldMeta,
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
  const { component, children, render } = props;
  React.useEffect(() => {
    if (__DEV__) {
      invariant(
        !props.render,
        `<Formik render> has been deprecated and will be removed in future versions of Formik. Please use a child callback function instead. To get rid of this warning, replace <Formik render={(props) => ...} /> with <Formik>{(props) => ...}</Formik>`
      );
    }
    // eslint-disable-next-line
  }, []);
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
    Formik cannot determine which value to update. For more info see https://github.com/jaredpalmer/formik#${documentationAnchorLink}
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
  let data: FormikValues = {};
  for (let k in values) {
    if (values.hasOwnProperty(k)) {
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

  source.forEach(function(e: any, i: number) {
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

/** Return multi select values based on an array of options */
function getSelectedValues(options: any[]) {
  return Array.from(options)
    .filter(el => el.selected)
    .map(el => el.value);
}

/** Return the next value for a checkbox */
function getValueForCheckbox(
  currentValue: string | any[],
  checked: boolean,
  valueProp: any
) {
  // eslint-disable-next-line eqeqeq
  if (valueProp == 'true' || valueProp == 'false') {
    return !!checked;
  }

  if (checked && valueProp) {
    return Array.isArray(currentValue)
      ? currentValue.concat(valueProp)
      : [valueProp];
  }
  if (!Array.isArray(currentValue)) {
    return !currentValue;
  }
  const index = currentValue.indexOf(valueProp);
  if (index < 0) {
    return currentValue;
  }
  return currentValue.slice(0, index).concat(currentValue.slice(index + 1));
}

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.
// @see https://gist.github.com/gaearon/e7d97cdf38a2907924ea12e4ebdf3c85
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' &&
  typeof window.document !== 'undefined' &&
  typeof window.document.createElement !== 'undefined'
    ? React.useLayoutEffect
    : React.useEffect;

function useEventCallback<T extends (...args: any[]) => any>(fn: T): T {
  const ref: any = React.useRef(fn);

  // we copy a ref to the callback scoped to the current state/props on each render
  useIsomorphicLayoutEffect(() => {
    ref.current = fn;
  });

  return React.useCallback(
    (...args: any[]) => ref.current.apply(void 0, args),
    []
  ) as T;
}
