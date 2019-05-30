import * as React from 'react';
import isEqual from 'react-fast-compare';
import deepmerge from 'deepmerge';
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
} from './utils';
import { FormikProvider } from './FormikContext';
import invariant from 'tiny-warning';
import { LowPriority, unstable_runWithPriority } from 'scheduler';

// We already used FormikActions. So we'll go all Elm-y, and use Message.
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
  | { type: 'SET_FORMIK_STATE'; payload: FormikState<Values> }
  | { type: 'RESET_FORM'; payload: FormikState<Values> };

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
    case 'SET_FORMIK_STATE':
      return { ...state, ...msg.payload };
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
const emptyErrors: FormikErrors<any> = {};
const emptyTouched: FormikTouched<any> = {};

// This is an object that contains a map of all registered fields
// and their validate functions
interface FieldRegistry {
  [field: string]: {
    validate: (value: any) => string | Promise<string> | undefined;
  };
}
const emptyFieldRegistry: FieldRegistry = {};

function useFormikInternal<Values = object>({
  validateOnChange = true,
  validateOnBlur = true,
  isInitialValid,
  enableReinitialize = false,
  onSubmit,
  ...rest
}: FormikConfig<Values>) {
  const props = { validateOnChange, validateOnBlur, onSubmit, ...rest };
  const initialValues = React.useRef(props.initialValues);
  const initialErrors = React.useRef(props.initialErrors || emptyErrors);
  const initialTouched = React.useRef(props.initialTouched || emptyTouched);
  const initialStatus = React.useRef(props.initialStatus);
  const isMounted = React.useRef<boolean>(false);
  const fieldRegistry = React.useRef<FieldRegistry>(emptyFieldRegistry);
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      invariant(
        typeof isInitialValid === 'undefined',
        'isInitialValid has been deprecated and will be removed in future versions of Formik. Please use initialErrors instead.'
      );
    }
  }, [isInitialValid]);

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
    errors: props.initialErrors || {},
    touched: props.initialTouched || {},
    status: props.initialStatus,
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  });

  const runValidateHandler = React.useCallback(
    (values: Values, field?: string): Promise<FormikErrors<Values>> => {
      return new Promise(resolve => {
        const maybePromisedErrors = (props.validate as any)(values, field);
        if (maybePromisedErrors === undefined) {
          resolve(emptyErrors);
        } else if (isPromise(maybePromisedErrors)) {
          (maybePromisedErrors as Promise<any>).then(
            () => {
              resolve(emptyErrors);
            },
            errors => {
              resolve(errors);
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
    (values: Values, field?: string) => {
      return new Promise(resolve => {
        const validationSchema = props.validationSchema;
        const schema = isFunction(validationSchema)
          ? validationSchema(field)
          : validationSchema;
        let promise =
          field && schema.validateAt
            ? schema.validateAt(field, values)
            : validateYupSchema(values, schema);
        promise.then(
          () => {
            resolve(emptyErrors);
          },
          (err: any) => {
            resolve(yupToFormErrors(err));
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
    },
    [runAllValidations, state.values]
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
    },
    [state.values, state.errors, runAllValidations]
  );

  const resetForm = React.useCallback(
    (nextState?: FormikState<Values>) => {
      const values =
        nextState && nextState.values
          ? nextState.values
          : initialValues.current
          ? initialValues.current
          : props.initialValues;
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
    [
      props.initialErrors,
      props.initialStatus,
      props.initialTouched,
      props.initialValues,
    ]
  );

  React.useEffect(() => {
    if (
      enableReinitialize &&
      isMounted.current === true &&
      !isEqual(initialValues.current, props.initialValues)
    ) {
      resetForm();
    }
  }, [enableReinitialize, props.initialValues, resetForm]);

  const validateField = useEventCallback(
    (name: string) => {
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
            .then((x: any) => x, (e: any) => e)
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
    },
    [state.values]
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
    (touched: FormikTouched<Values>) => {
      dispatch({ type: 'SET_TOUCHED', payload: touched });
      return validateOnBlur
        ? validateFormWithLowPriority(state.values)
        : Promise.resolve();
    },
    [validateFormWithLowPriority, state.values, validateOnBlur]
  );

  const setErrors = React.useCallback((errors: FormikErrors<Values>) => {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }, []);

  const setValues = useEventCallback(
    (values: Values) => {
      dispatch({ type: 'SET_VALUES', payload: values });
      return validateOnChange
        ? validateFormWithLowPriority(state.values)
        : Promise.resolve();
    },
    [validateFormWithLowPriority, state.values, validateOnChange]
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
    (field: string, value: any, shouldValidate: boolean = true) => {
      dispatch({
        type: 'SET_FIELD_VALUE',
        payload: {
          field,
          value,
        },
      });
      return validateOnChange && shouldValidate
        ? validateFormWithLowPriority(setIn(state.values, field, value))
        : Promise.resolve();
    },
    [validateFormWithLowPriority, state.values, validateOnChange]
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
        const {
          type,
          name,
          id,
          value,
          checked,
          outerHTML,
        } = (eventOrTextValue as React.ChangeEvent<any>).target;
        field = maybePath ? maybePath : name ? name : id;
        if (!field && process.env.NODE_ENV !== 'production') {
          warnAboutMissingIdentifier({
            htmlContent: outerHTML,
            documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
            handlerName: 'handleChange',
          });
        }
        val = /number|range/.test(type)
          ? ((parsed = parseFloat(value)), isNaN(parsed) ? '' : parsed)
          : /checkbox/.test(type)
          ? checked
          : value;
      }

      if (field) {
        // Set form fields by name
        setFieldValue(field, val);
      }
    },
    [setFieldValue]
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
    (
      field: string,
      touched: boolean = true,
      shouldValidate: boolean = true
    ) => {
      dispatch({
        type: 'SET_FIELD_TOUCHED',
        payload: {
          field,
          value: touched,
        },
      });
      return validateOnBlur && shouldValidate
        ? validateFormWithLowPriority(state.values)
        : Promise.resolve();
    },
    [validateFormWithLowPriority, state.values, validateOnBlur]
  );

  const executeBlur = React.useCallback(
    (e: any, path?: string) => {
      if (e.persist) {
        e.persist();
      }
      const { name, id, outerHTML } = e.target;
      const field = path ? path : name ? name : id;

      if (!field && process.env.NODE_ENV !== 'production') {
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

  function setFormikState(
    stateOrCb:
      | FormikState<Values>
      | ((state: FormikState<Values>) => FormikState<Values>)
  ): void {
    if (isFunction(stateOrCb)) {
      dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb(state) });
    } else {
      dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb });
    }
  }

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
  }, [imperativeMethods, onSubmit, state.values]);

  const submitForm = useEventCallback(() => {
    dispatch({ type: 'SUBMIT_ATTEMPT' });
    return validateFormWithHighPriority().then(
      (combinedErrors: FormikErrors<Values>) => {
        const isActuallyValid = Object.keys(combinedErrors).length === 0;
        if (isActuallyValid) {
          return Promise.resolve(executeSubmit())
            .then(() => {
              if (!!isMounted.current) {
                dispatch({ type: 'SUBMIT_SUCCESS' });
              }
            })
            .catch(_errors => {
              if (!!isMounted.current) {
                dispatch({ type: 'SUBMIT_FAILURE' });
              }
            });
        } else if (!!isMounted.current) {
          // ^^^ Make sure Formik is still mounted before calling setState
          dispatch({ type: 'SUBMIT_FAILURE' });
          return;
        }
        return;
      }
    );
  }, [executeSubmit, validateFormWithHighPriority]);

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
      if (
        process.env.NODE_ENV !== 'production' &&
        typeof document !== 'undefined'
      ) {
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
    },
    [submitForm]
  );
  const handleReset = useEventCallback(() => {
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
  }, [imperativeMethods, props.onReset, resetForm, state.values]);

  const getFieldMeta = React.useCallback(
    (name: string) => {
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
    (
      name: string,
      type: string
    ): [FieldInputProps<any>, FieldMetaProps<any>] => {
      const field = {
        name,
        value:
          type && (type === 'radio' || type === 'checkbox')
            ? undefined // React uses checked={} for these inputs
            : getIn(state.values, name),
        onChange: handleChange,
        onBlur: handleBlur,
      };

      return [field, getFieldMeta(name)];
    },
    [getFieldMeta, handleBlur, handleChange, state.values]
  );

  const dirty = React.useMemo(
    () => !isEqual(initialValues.current, state.values),
    [state.values]
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
    validateOnBlur,
    validateOnChange,
  };

  return ctx;
}

export function Formik<Values = object, ExtraProps = {}>(
  props: FormikConfig<Values> & ExtraProps
) {
  const formikbag = useFormikInternal<Values>(props);
  const { component, children, render } = props;
  return (
    <FormikProvider value={formikbag}>
      {component
        ? React.createElement(component as any, formikbag)
        : render
        ? render(formikbag)
        : children // children come last, always called
        ? isFunction(children)
          ? (children as ((bag: FormikProps<Values>) => React.ReactNode))(
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
  if (yupError.inner.length === 0) {
    return setIn(errors, yupError.path, yupError.message);
  }
  for (let err of yupError.inner) {
    if (!(errors as any)[err.path]) {
      errors = setIn(errors, err.path, err.message);
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
  let validateData: Partial<T> = {};
  for (let k in values) {
    if (values.hasOwnProperty(k)) {
      const key = String(k);
      validateData[key] = values[key] !== '' ? values[key] : undefined;
    }
  }
  return schema[sync ? 'validateSync' : 'validate'](validateData, {
    abortEarly: false,
    context: context,
  });
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

function useEventCallback<T extends (...args: any[]) => any>(
  fn: T,
  dependencies: React.DependencyList
): T {
  const ref: any = React.useRef(() => {
    throw new Error('Cannot call an event handler while rendering.');
  });

  React.useEffect(() => {
    ref.current = fn;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...dependencies]);

  return React.useCallback<any>(
    (...argz: any[]) => {
      const fn = ref.current;
      return fn(...argz);
    },
    [ref]
  ) as T;
}
