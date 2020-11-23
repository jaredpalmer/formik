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
  FieldHelperProps,
  FieldInputProps,
  FormikHelpers,
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
import { unstable_LowPriority, unstable_runWithPriority } from 'scheduler';
import { useEventCallback } from './helpers';

type FormikMessage<Values> =
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'SUBMIT_FAILURE' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SET_ISVALIDATING'; payload: boolean }
  | { type: 'SET_ISSUBMITTING'; payload: boolean }
  | { type: 'SET_VALUES'; payload: Values }
  | { type: 'RESET_VALUES'; payload: Values }
  | { type: 'SET_FIELD_VALUE'; payload: { field: string; value?: any } }
  | { type: 'SET_FIELD_TOUCHED'; payload: { field: string; value?: boolean } }
  | { type: 'SET_FIELD_ERROR'; payload: { field: string; value?: string } }
  | { type: 'SET_TOUCHED'; payload: FormikTouched<Values> }
  | { type: 'RESET_TOUCHED'; payload: FormikTouched<Values> }
  | { type: 'SET_ERRORS'; payload: FormikErrors<Values> }
  | { type: 'RESET_ERRORS'; payload: FormikErrors<Values> }
  | { type: 'SET_STATUS'; payload: any }
  | { type: 'RESET_STATUS'; payload: any }
  | {
      type: 'SET_FORMIK_STATE';
      payload: FormikState<Values>;
    }
  | {
      type: 'RESET_FORM';
      payload: FormikState<Values>;
    };

const isChangeEvent = (value: any): value is React.ChangeEvent<any> =>
  typeof value === 'object' && typeof value.persist === 'function';

// State reducer
function formikReducer<Values>(
  state: FormikState<Values>,
  msg: FormikMessage<Values>
) {
  switch (msg.type) {
    case 'SET_VALUES':
      return { 
        ...state, 
        values: msg.payload, 
        dirty: !isEqual(state.initialValues, msg.payload) 
      };
    case 'RESET_VALUES':
      return { ...state, initialValues: msg.payload, dirty: false };
    case 'SET_TOUCHED':
      return { ...state, touched: msg.payload };
    case 'RESET_TOUCHED':
      return { 
        ...state, 
        initialTouched: msg.payload, 
        touched: msg.payload 
      };
    case 'SET_ERRORS':
      if (isEqual(state.errors, msg.payload)) {
        return state;
      }

      return { ...state, errors: msg.payload };
    case 'RESET_ERRORS':
      return { 
        ...state, 
        initialErrors: msg.payload, 
        errors: msg.payload 
      };
    case 'SET_STATUS':
      return { ...state, status: msg.payload };
    case 'RESET_STATUS':
      return { 
        ...state, 
        initialStatus: msg.payload,
        status: msg.payload 
     };
    case 'SET_ISSUBMITTING':
      return { ...state, isSubmitting: msg.payload };
    case 'SET_ISVALIDATING':
      return { ...state, isValidating: msg.payload };
    case 'SET_FIELD_VALUE':
      const newValues = setIn(state.values, msg.payload.field, msg.payload.value);
      return {
        ...state,
        values: newValues,
        dirty: !isEqual(state.initialValues, newValues) 
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
      return msg.payload;
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

type GetStateFn<Values> = () => FormikState<Values>;
type ValidationHandler<Values extends FormikValues> = (values: Values, field?: string) => Promise<FormikErrors<Values>>;

// #region Callbacks
const selectRunValidateHandler = <Values extends FormikValues>(
  validate: FormikConfig<Values>['validate']
): ValidationHandler<Values> =>
  (values, field) => {
    return new Promise((resolve, reject) => {
      const maybePromisedErrors = (validate as any)(values, field);
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
  };

  const selectRunValidationSchema = <Values extends FormikValues>(
    validationSchema: FormikConfig<Values>['validationSchema']
  ): ValidationHandler<Values> => (values, field) => {
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
  };

const selectRunSingleFieldLevelValidation = (fieldRegistry: React.MutableRefObject<FieldRegistry>) => 
  (field: string, value: void | string): Promise<string> => {
    return new Promise(resolve =>
      resolve(fieldRegistry.current[field].validate(value))
    );
  }

const selectRunFieldLevelValidations = <Values extends FormikValues>(
  runSingleFieldLevelValidation: ReturnType<typeof selectRunSingleFieldLevelValidation>,
  fieldRegistry: React.MutableRefObject<FieldRegistry>
): ValidationHandler<Values> => 
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
}
const selectRunAllValidations = <Values extends FormikValues>(
  validate: FormikConfig<Values>['validate'],
  validationSchema: FormikConfig<Values>['validationSchema'],
  runFieldLevelValidations: ValidationHandler<Values>,
  runValidationSchema: ValidationHandler<Values>,
  runValidateHandler: ValidationHandler<Values>
) => 
  (values: Values) => {
    return Promise.all([
      runFieldLevelValidations(values),
      validationSchema ? runValidationSchema(values) : {},
      validate ? runValidateHandler(values) : {},
    ]).then(([fieldErrors, schemaErrors, validateErrors]) => {
      const combinedErrors = deepmerge.all<FormikErrors<Values>>(
        [fieldErrors, schemaErrors, validateErrors],
        { arrayMerge }
      );
      return combinedErrors;
    });
  }

const selectValidateFormWithLowPriorities = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  runAllValidations: ValidationHandler<Values>,
  isMounted: React.MutableRefObject<boolean>
) => (values?: Values) => {
  return unstable_runWithPriority(unstable_LowPriority, () => {
    return runAllValidations(values ?? getState().values)
      .then(combinedErrors => {
        if (!!isMounted.current) {
          dispatch({ type: 'SET_ERRORS', payload: combinedErrors });
        }
        return combinedErrors;
      })
      .catch(actualException => {
        if (process.env.NODE_ENV !== 'production') {
          // Users can throw during validate, however they have no way of handling their error on touch / blur. In low priority, we need to handle it
          console.warn(
            `Warning: An unhandled error was caught during low priority validation in <Formik validate />`,
            actualException
          );
        }
      });
  });
}
const selectValidateFormWithHighPriority = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  runAllValidations: ValidationHandler<Values>,
  isMounted: React.MutableRefObject<boolean>,
) => (values?: Values) => {
  dispatch({ type: 'SET_ISVALIDATING', payload: true });
  return runAllValidations(values ?? getState().values).then(combinedErrors => {
    if (!!isMounted.current) {
      dispatch({ type: 'SET_ISVALIDATING', payload: false });
      if (!isEqual(getState().errors, combinedErrors)) {
        dispatch({ type: 'SET_ERRORS', payload: combinedErrors });
      }
    }
    return combinedErrors;
  });
}

const selectResetForm = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  initialErrors: FormikConfig<Values>['initialErrors'],
  initialTouched: FormikConfig<Values>['initialTouched'],
  initialStatus: FormikConfig<Values>['initialStatus'],
  onReset: FormikConfig<Values>['onReset'],
  imperativeMethods: FormikHelpers<Values>
) => (nextState?: Partial<FormikState<Values>>) => {
  const values =
    nextState && nextState.values
      ? nextState.values
      : getState().initialValues;
  const errors =
    nextState && nextState.errors
      ? nextState.errors
      : getState().initialErrors
      ? getState().initialErrors
      : initialErrors ?? {};
  const touched =
    nextState && nextState.touched
      ? nextState.touched
      : getState().initialTouched
      ? getState().initialTouched
      : initialTouched || {};
  const status =
    nextState && nextState.status
      ? nextState.status
      : getState().initialStatus
      ? getState().initialStatus
      : initialStatus;
      
  const dispatchFn = () => {
    dispatch({
      type: 'RESET_FORM',
      payload: {
        initialValues: values,
        initialErrors: errors,
        initialTouched: touched,
        initialStatus: status,
        values,
        errors,
        touched,
        status,
        isSubmitting: !!nextState && !!nextState.isSubmitting,
        isValidating: !!nextState && !!nextState.isValidating,
        submitCount:
          !!nextState &&
          !!nextState.submitCount &&
          typeof nextState.submitCount === 'number'
            ? nextState.submitCount
            : 0,
        dirty: false,
      },
    });
  };

  if (onReset) {
    const maybePromisedOnReset = (onReset)(
      getState().values,
      imperativeMethods
    );

    if (isPromise(maybePromisedOnReset)) {
      maybePromisedOnReset.then(dispatchFn);
    } else {
      dispatchFn();
    }
  } else {
    dispatchFn();
  }
}

const selectValidateField = <Values extends FormikValues>(
  fieldRegistry: React.MutableRefObject<FieldRegistry>,
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validationSchema: FormikConfig<Values>['validationSchema'],
  runValidationSchema: ValidationHandler<Values>,
) => (name: string) => {
  // This will efficiently validate a single field by avoiding state
  // changes if the validation function is synchronous. It's different from
  // what is called when using validateForm.
  if (isFunction(fieldRegistry.current[name].validate)) {
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
  } else if (validationSchema) {
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
}

const selectSetTouched = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateOnBlur: FormikConfig<Values>['validateOnBlur'],
  validateFormWithLowPriority: ValidationHandler<Values>,
) => (touched: FormikTouched<Values>, shouldValidate?: boolean) => {
  dispatch({ type: 'SET_TOUCHED', payload: touched });
  const willValidate =
    shouldValidate === undefined ? validateOnBlur : shouldValidate;
  return willValidate
    ? validateFormWithLowPriority(getState().values)
    : Promise.resolve();
}

const selectSetValues = <Values extends FormikValues>(
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateOnChange: FormikConfig<Values>['validateOnChange'],
  validateFormWithLowPriority: ValidationHandler<Values>
) => (values: Values, shouldValidate?: boolean) => {
  dispatch({ type: 'SET_VALUES', payload: values });
  const willValidate =
    shouldValidate === undefined ? validateOnChange : shouldValidate;
  return willValidate
    ? validateFormWithLowPriority(values)
    : Promise.resolve();
}

const selectSetFieldError = <Values extends FormikValues>(
  dispatch: React.Dispatch<FormikMessage<Values>>
) => (field: string, value: string | undefined) => {
  dispatch({
    type: 'SET_FIELD_ERROR',
    payload: { field, value },
  });
}

const selectSetFieldValue = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateOnChange: FormikConfig<Values>['validateOnChange'],
  validateFormWithLowPriority: ValidationHandler<Values>,
) => (field: string, value: any, shouldValidate?: boolean) => {
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
    ? validateFormWithLowPriority(setIn(getState().values, field, value))
    : Promise.resolve();
}
type SetFieldTouched<Values> = (field: string, touched?: boolean, shouldValidate?: boolean) => Promise<FormikErrors<Values> | void>;
const selectSetFieldTouched = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateFormWithLowPriority: ValidationHandler<Values>,
  validateOnBlur: FormikConfig<Values>['validateOnBlur']
): SetFieldTouched<Values> => (field, touched = true, shouldValidate) => {
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
    ? validateFormWithLowPriority(getState().values)
    : Promise.resolve();
}
const selectSetFormikState = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>
) => (
  stateOrCb:
    | FormikState<Values>
    | ((state: FormikState<Values>) => FormikState<Values>)
): void => {
  if (isFunction(stateOrCb)) {
    dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb(getState()) });
  } else {
    dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb });
  }
}
type SubmitForm = () => Promise<any | void>;
const selectSubmitForm = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateFormWithHighPriority: ValidationHandler<Values>,
  executeSubmit: () => void | Promise<any>,
  isMounted: React.MutableRefObject<boolean>,
): SubmitForm => () => {
  const values = getState().values;

  dispatch({ type: 'SUBMIT_ATTEMPT' });

  return validateFormWithHighPriority(values).then(
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
}
const selectExecuteBlur = <Values extends FormikValues>(
  setFieldTouched: SetFieldTouched<Values>
) => (e: any, path?: string) => {
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
}
const selectHandleSubmit = (
  submitForm: SubmitForm,
) => (e?: React.FormEvent<HTMLFormElement>) => {
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
// #endregion

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
  const isMounted = React.useRef<boolean>(false);
  const fieldRegistry = React.useRef<FieldRegistry>({});
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
  React.useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

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
  const refBoundFormikReducer = React.useCallback((
    state: FormikState<Values>,
    msg: FormikMessage<Values>
  ) => {
      const result = formikReducer(state, msg);

      stateRef.current = result;

      return result;
  }, []);

  const getState = React.useCallback(() => stateRef.current, [stateRef]);

  const [state, dispatch] = React.useReducer<
    React.Reducer<FormikState<Values>, FormikMessage<Values>>
  >(refBoundFormikReducer, stateRef.current);

  const runValidateHandler = useEventCallback(selectRunValidateHandler(props.validate), [props.validate]);

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  const runValidationSchema = useEventCallback(
    selectRunValidationSchema<Values>(props.validationSchema),
    [props.validationSchema]
  );

  const runSingleFieldLevelValidation = React.useCallback(
    selectRunSingleFieldLevelValidation(fieldRegistry),
    [fieldRegistry]
  );

  const runFieldLevelValidations = useEventCallback(
    selectRunFieldLevelValidations<Values>(runSingleFieldLevelValidation, fieldRegistry),
    [runSingleFieldLevelValidation, fieldRegistry]
  );

  // Run all validations and return the result
  const runAllValidations = useEventCallback(
    selectRunAllValidations(props.validate, props.validationSchema, runFieldLevelValidations, runValidationSchema, runValidateHandler),
    [
      props.validate,
      props.validationSchema,
      runFieldLevelValidations,
      runValidationSchema,
      runValidateHandler,
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
    selectValidateFormWithLowPriorities(getState, dispatch, runAllValidations, isMounted),
    [getState, dispatch, runAllValidations, isMounted]
  );

  // Run all validations methods and update state accordingly
  const validateFormWithHighPriority = useEventCallback(
    selectValidateFormWithHighPriority(getState, dispatch, runAllValidations, isMounted),
    [getState, dispatch, runAllValidations, isMounted]
  );

  const validateField = useEventCallback(
    selectValidateField(
      fieldRegistry, 
      getState, 
      dispatch, 
      props.validationSchema, 
      runValidationSchema
    ),
    [fieldRegistry, getState, dispatch, props.validationSchema, runValidationSchema]
  );

  const registerField = React.useCallback((name: string, { validate }: any) => {
    fieldRegistry.current[name] = {
      validate,
    };
  }, []);

  const unregisterField = React.useCallback((name: string) => {
    delete fieldRegistry.current[name];
  }, []);

  const setTouched = useEventCallback(
    selectSetTouched(
      getState, 
      dispatch, 
      props.validateOnBlur, 
      validateFormWithLowPriority
    ),
    [getState, dispatch, props.validateOnBlur, validateFormWithLowPriority]
  );

  const setErrors = React.useCallback((errors: FormikErrors<Values>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const setValues = useEventCallback(
    selectSetValues(dispatch, props.validateOnChange, validateFormWithLowPriority),
    [dispatch, props.validateOnChange, validateFormWithLowPriority]
  );

  const setFieldError = React.useCallback(
    selectSetFieldError(dispatch),
    [dispatch]
  );

  const setFieldValue = useEventCallback(
    selectSetFieldValue(
      getState, 
      dispatch, 
      props.validateOnChange, 
      validateFormWithLowPriority
    ),
    [getState, dispatch, props.validateOnChange, validateFormWithLowPriority]
  );

  const setFieldTouched = useEventCallback(
    selectSetFieldTouched(
      getState, 
      dispatch, 
      validateFormWithLowPriority,
      props.validateOnBlur, 
    ),
    [getState, dispatch, validateFormWithLowPriority, props.validateOnBlur]
  );

  const setFormikState = React.useCallback(
    selectSetFormikState(getState, dispatch),
    [getState, dispatch]
  );

  const setStatus = React.useCallback((status: any) => {
    dispatch({ type: 'SET_STATUS', payload: status });
  }, [dispatch]);

  const setSubmitting = React.useCallback((isSubmitting: boolean) => {
    dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting });
  }, [dispatch]);

  const executeSubmit = useEventCallback(
    () => onSubmit(getState().values, imperativeMethods), 
    []
  );

  const submitForm = useEventCallback(
    selectSubmitForm(
      getState, 
      dispatch, 
      validateFormWithHighPriority, 
      executeSubmit, 
      isMounted
    ),
    [getState, dispatch, validateFormWithHighPriority, executeSubmit, isMounted]
  );

  const imperativeMethods: FormikHelpers<Values> = {
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
    resetForm: (nextState?: Partial<FormikState<Values>> | undefined) => resetForm(nextState),
  };

  const resetForm = useEventCallback(
    selectResetForm(
      getState, 
      dispatch, 
      props.initialErrors, 
      props.initialTouched, 
      props.initialStatus,
      props.onReset,
      imperativeMethods,
    ),
    [props.initialErrors, props.initialStatus, props.initialTouched, props.onReset]
  );

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
  }, [enableReinitialize, props.initialValues, resetForm, validateOnMount, validateFormWithLowPriority]);

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
        if (isChangeEvent(eventOrTextValue)) {
          eventOrTextValue.persist();
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

  const handleChange = useEventCallback(
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

  const executeBlur = React.useCallback(
    selectExecuteBlur(setFieldTouched),
    [setFieldTouched]
  );

  const handleBlur = useEventCallback(
    (eventOrString: any): void | ((e: any) => void) => {
      if (isString(eventOrString)) {
        return event => executeBlur(event, eventOrString);
      } else {
        executeBlur(eventOrString);
      }
    },
    [executeBlur]
  );

  const handleSubmit = useEventCallback(
    selectHandleSubmit(submitForm),
    [submitForm]
  );

  const handleReset = useEventCallback(e => {
    if (e && e.preventDefault && isFunction(e.preventDefault)) {
      e.preventDefault();
    }

    if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
      e.stopPropagation();
    }

    resetForm();
  }, [resetForm]);

  /**
   * These getters are not related to a render.
   *
   * They use refs!
   */
  const getFieldMeta = React.useCallback(
    (name: string): FieldMetaProps<any> => {
      return {
        value: getIn(stateRef.current.values, name),
        error: getIn(stateRef.current.errors, name),
        touched: !!getIn(stateRef.current.touched, name),
        initialValue: getIn(stateRef.current.initialValues, name),
        initialTouched: !!getIn(stateRef.current.initialTouched, name),
        initialError: getIn(stateRef.current.initialErrors, name),
      };
    },
    []
  );

  const getFieldHelpers = React.useCallback(
    (name: string): FieldHelperProps<any> => {
      return {
        setValue: (value: any, shouldValidate?: boolean) =>
          setFieldValue(name, value, shouldValidate),
        setTouched: (value: boolean, shouldValidate?: boolean) =>
          setFieldTouched(name, value, shouldValidate),
        setError: (value: any) => setFieldError(name, value),
      };
    },
    [setFieldValue, setFieldTouched, setFieldError]
  );

  const getFieldProps = React.useCallback(
    (nameOrOptions): FieldInputProps<any> => {
      const isAnObject = isObject(nameOrOptions);
      const name = isAnObject ? nameOrOptions.name : nameOrOptions;
      const valueState = getIn(stateRef.current.values, name);

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
    [handleBlur, handleChange]
  );

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

  const ctx = {
    ...state,
    initialValues: stateRef.current.initialValues,
    initialErrors: stateRef.current.initialErrors,
    initialTouched: stateRef.current.initialTouched,
    initialStatus: stateRef.current.initialStatus,
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
    unregisterField,
    registerField,
    getFieldProps,
    getFieldMeta,
    getFieldHelpers,
    validateOnBlur,
    validateOnChange,
    validateOnMount,
    stateRef
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
  // If the current value was a boolean, return a boolean
  if (typeof currentValue === 'boolean') {
    return Boolean(checked);
  }

  // If the currentValue was not a boolean we want to return an array
  let currentArrayOfValues = [];
  let isValueInArray = false;
  let index = -1;

  if (!Array.isArray(currentValue)) {
    // eslint-disable-next-line eqeqeq
    if (!valueProp || valueProp == 'true' || valueProp == 'false') {
      return Boolean(checked);
    }
  } else {
    // If the current value is already an array, use it
    currentArrayOfValues = currentValue;
    index = currentValue.indexOf(valueProp);
    isValueInArray = index >= 0;
  }

  // If the checkbox was checked and the value is not already present in the aray we want to add the new value to the array of values
  if (checked && valueProp && !isValueInArray) {
    return currentArrayOfValues.concat(valueProp);
  }

  // If the checkbox was unchecked and the value is not in the array, simply return the already existing array of values
  if (!isValueInArray) {
    return currentArrayOfValues;
  }

  // If the checkbox was unchecked and the value is in the array, remove the value and return the array
  return currentArrayOfValues
    .slice(0, index)
    .concat(currentArrayOfValues.slice(index + 1));
}
