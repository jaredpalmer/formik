import {
  FormikErrors,
  FormikValues,
  FormikConfig,
  ValidationHandler,
  FieldRegistry,
  GetStateFn,
  FormikMessage,
  FormikHelpers,
  FormikState,
  FieldInputProps,
  FieldMetaProps,
  FormikRefs,
  FieldHelperProps,
} from './types';
import { isFunction, isEqual } from 'lodash';
import deepmerge from 'deepmerge';
import {
  isPromise,
  arrayMerge,
  validateYupSchema,
  getIn,
  setIn,
  yupToFormErrors,
  warnAboutMissingIdentifier,
  getActiveElement,
  isObject,
  isString,
  getValueForCheckbox,
  getSelectedValues,
  isInputEvent,
  defaultFormatFn,
  defaultParseFn,
  numberParseFn,
  isReactNative,
} from './utils';
import { emptyErrors } from './constants';
import invariant from 'tiny-warning';

export type AnyDispatch<Values> = React.Dispatch<FormikMessage<Values, any>>;

export type IsFormValidFn<Values> = (
  errors: FormikErrors<Values>,
  dirty: boolean
) => boolean;

export const selectIsFormValid = <Values extends FormikValues>(
  props: FormikConfig<Values>
): IsFormValidFn<Values> => (errors, dirty) => {
  return typeof props.isInitialValid !== 'undefined'
    ? dirty
      ? errors && Object.keys(errors).length === 0
      : props.isInitialValid !== false && isFunction(props.isInitialValid)
      ? props.isInitialValid(props)
      : props.isInitialValid
    : errors && Object.keys(errors).length === 0;
};

export const selectRunValidateHandler = <Values extends FormikValues>(
  validate: FormikConfig<Values>['validate']
): ValidationHandler<Values> => (values, field) => {
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

export const selectRunValidationSchema = <Values extends FormikValues>(
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

export const selectRunSingleFieldLevelValidation = (
  fieldRegistry: React.MutableRefObject<FieldRegistry>
) => (field: string, value: void | string): Promise<string> => {
  return new Promise(resolve =>
    resolve(fieldRegistry.current[field].validate(value) as string)
  );
};

export const selectRunFieldLevelValidations = <Values extends FormikValues>(
  runSingleFieldLevelValidation: ReturnType<
    typeof selectRunSingleFieldLevelValidation
  >,
  fieldRegistry: React.MutableRefObject<FieldRegistry>
): ValidationHandler<Values> => (
  values: Values
): Promise<FormikErrors<Values>> => {
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
};

export const selectRunAllValidations = <Values extends FormikValues>(
  validate: FormikConfig<Values>['validate'],
  validationSchema: FormikConfig<Values>['validationSchema'],
  runFieldLevelValidations: ValidationHandler<Values>,
  runValidationSchema: ValidationHandler<Values>,
  runValidateHandler: ValidationHandler<Values>
) => (values: Values) => {
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
};

export type ValidateFormFn<Values extends FormikValues> = (
  values?: Values
) => Promise<FormikErrors<Values>>;

export const selectValidateForm = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  runAllValidations: ValidationHandler<Values>,
  isMounted: React.MutableRefObject<boolean>
): ValidateFormFn<Values> => values => {
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
};

export type ResetFormFn<
  Values extends FormikValues,
  State extends FormikState<Values>
> = (nextState?: Partial<State> | undefined) => void;

export const selectResetForm = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  props: FormikConfig<Values>,
  refs: FormikRefs<Values>,
  imperativeMethods: FormikHelpers<Values>
) => (nextState?: Partial<FormikState<Values>>) => {
  const values =
    nextState && nextState.values
      ? // create a new copy of `values` to test against initialValues
        { ...nextState.values }
      : refs.initialValues.current;
  const errors =
    nextState && nextState.errors
      ? nextState.errors
      : refs.initialErrors.current
      ? refs.initialErrors.current
      : props.initialErrors || {};
  const touched =
    nextState && nextState.touched
      ? nextState.touched
      : refs.initialTouched.current
      ? refs.initialTouched.current
      : props.initialTouched || {};
  const status =
    nextState && nextState.status
      ? nextState.status
      : refs.initialStatus.current
      ? refs.initialStatus.current
      : props.initialStatus;

  refs.initialValues.current = values;
  refs.initialErrors.current = errors;
  refs.initialTouched.current = touched;
  refs.initialStatus.current = status;

  const dispatchFn = () => {
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
};

export type HandleResetFn = (e?: any) => void;

export const selectHandleReset = <
  Values extends FormikValues,
  State extends FormikState<Values>
>(
  resetForm: ResetFormFn<Values, State>
): HandleResetFn => e => {
  if (e && e.preventDefault && isFunction(e.preventDefault)) {
    e.preventDefault();
  }

  if (e && e.stopPropagation && isFunction(e.stopPropagation)) {
    e.stopPropagation();
  }

  resetForm();
};

export type ValidateFieldFn = (
  name: string
) => Promise<void | string | undefined>;

export const selectValidateField = <Values extends FormikValues>(
  fieldRegistry: React.MutableRefObject<FieldRegistry>,
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  validationSchema: FormikConfig<Values>['validationSchema'],
  runValidationSchema: ValidationHandler<Values>
): ValidateFieldFn => name => {
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
          value: maybePromise,
        },
      });
      return Promise.resolve(maybePromise);
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
};

export type SetTouchedFn<Values extends FormikValues> = (
  touched: import('./types').FormikTouched<Values>,
  shouldValidate?: boolean | undefined
) => Promise<void | FormikErrors<Values>>;

export const selectSetTouched = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  validateOnBlur: FormikConfig<Values>['validateOnBlur'],
  validateForm: ValidateFormFn<Values>
): SetTouchedFn<Values> => (touched, shouldValidate) => {
  dispatch({ type: 'SET_TOUCHED', payload: touched });
  const willValidate =
    shouldValidate === undefined ? validateOnBlur : shouldValidate;
  return willValidate ? validateForm(getState().values) : Promise.resolve();
};

export type SetValuesFn<Values extends FormikValues> = (
  values: Values,
  shouldValidate?: boolean | undefined
) => Promise<void | FormikErrors<Values>>;

export const selectSetValues = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  validateOnChange: FormikConfig<Values>['validateOnChange'],
  validateForm: ValidateFormFn<Values>
): SetValuesFn<Values> => (values, shouldValidate) => {
  const resolvedValues = isFunction(values)
    ? values(getState().values)
    : values;

  dispatch({ type: 'SET_VALUES', payload: resolvedValues });
  const willValidate =
    shouldValidate === undefined ? validateOnChange : shouldValidate;
  return willValidate ? validateForm(resolvedValues) : Promise.resolve();
};

export type SetErrorsFn<Values extends FormikValues> = (
  errors: FormikErrors<Values>
) => void;

export const selectSetErrors = <Values extends FormikValues>(
  dispatch: AnyDispatch<Values>
): SetErrorsFn<Values> => errors => {
  dispatch({ type: 'SET_ERRORS', payload: errors });
};

export type SetStatusFn = (status: any) => void;

export const selectSetStatus = <Values extends FormikValues>(
  dispatch: AnyDispatch<Values>
) => (status: any) => {
  dispatch({ type: 'SET_STATUS', payload: status });
};

export type SetFieldErrorFn = (
  field: string,
  value: string | undefined
) => void;

export type SetSubmittingFn = (isSubmitting: boolean) => void;

export const selectSetSubmitting = <Values extends FormikValues>(
  dispatch: AnyDispatch<Values>
): SetSubmittingFn => (isSubmitting: boolean) => {
  dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting });
};

export const selectSetFieldError = <Values extends FormikValues>(
  dispatch: AnyDispatch<Values>
): SetFieldErrorFn => (field, value) => {
  dispatch({
    type: 'SET_FIELD_ERROR',
    payload: { field, value },
  });
};

export type SetFieldValueFn<Values extends FormikValues> = (
  field: string,
  value: any,
  shouldValidate?: boolean | undefined
) => Promise<void | FormikErrors<Values>>;

export const selectSetFieldValue = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  validateOnChange: FormikConfig<Values>['validateOnChange'],
  validateForm: ValidateFormFn<Values>
): SetFieldValueFn<Values> => (field, value, shouldValidate) => {
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
    ? validateForm(setIn(getState().values, field, value))
    : Promise.resolve();
};

export const selectExecuteChange = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  setFieldValue: ReturnType<typeof selectSetFieldValue>
) => (
  eventOrTextValue: string | React.ChangeEvent<any>,
  maybePath?: string
) => {
  const state = getState();

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
    if ((eventOrTextValue as any).persist) {
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
};

/**
 * Event callback returned by `formik.handleChange`.
 */
export type HandleChangeEventFn = (event: React.ChangeEvent<any>) => void;

/**
 * Type of `formik.handleChange`.
 * May be an event callback, or accept a field name and return an event callback.
 */
export type HandleChangeFn = {
  (eventOrPath: React.ChangeEvent<any>): void;
  // Must remain the same as HandleChangeEventFn
  (event: string): HandleChangeEventFn;
};

/**
 * Note: TypeScript doesn't currently allow you to infer overloads from a Type.
 *
 * Instead, we make sure this function returns any possibility of HandleChangeFn,
 * and then cast it.
 */
export const selectHandleChange = (
  executeChange: ReturnType<typeof selectExecuteChange>
) =>
  ((
    eventOrPath: string | React.ChangeEvent<any>
  ): HandleChangeEventFn | void => {
    if (isString(eventOrPath)) {
      return (event: string | React.ChangeEvent<any>) =>
        executeChange(event, eventOrPath);
    } else {
      return executeChange(eventOrPath);
    }
  }) as HandleChangeFn;

export type SetFieldTouchedFn<Values extends FormikValues> = (
  field: string,
  touched?: boolean | undefined,
  shouldValidate?: boolean | undefined
) => Promise<void | FormikErrors<Values>>;

export const selectSetFieldTouched = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  validateForm: ValidateFormFn<Values>,
  validateOnBlur: FormikConfig<Values>['validateOnBlur']
): SetFieldTouchedFn<Values> => (field, touched = true, shouldValidate) => {
  dispatch({
    type: 'SET_FIELD_TOUCHED',
    payload: {
      field,
      value: touched,
    },
  });
  const willValidate =
    shouldValidate === undefined ? validateOnBlur : shouldValidate;
  return willValidate ? validateForm(getState().values) : Promise.resolve();
};

export type SetFormikStateFn<Values extends FormikValues> = (
  stateOrCb:
    | FormikState<Values>
    | ((state: FormikState<Values>) => FormikState<Values>)
) => void;

export const selectSetFormikState = <Values extends FormikValues>(
  dispatch: AnyDispatch<Values>
): SetFormikStateFn<Values> => stateOrCb => {
  if (isFunction(stateOrCb)) {
    dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb });
  } else {
    dispatch({ type: 'SET_FORMIK_STATE', payload: () => stateOrCb });
  }
};

export const selectExecuteBlur = <Values extends FormikValues>(
  setFieldTouched: SetFieldTouchedFn<Values>
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
};

/**
 * Event callback returned by `formik.handleBlur`.
 */
export type HandleBlurEventFn = (event: React.FocusEvent<any>) => void;

/**
 * Type of `formik.handleBlur`.
 * May be an event callback, or accept a field name and return an event callback.
 */
export type HandleBlurFn = {
  (eventOrString: string): HandleBlurEventFn;
  // Must remain the same as HandleBlurEventFn
  (event: React.FocusEvent<any>): void;
};

/**
 * Note: TypeScript doesn't currently allow you to infer overloads from a Type.
 *
 * Instead, we make sure this function returns any possibility of HandleBlurFn,
 * and then cast it.
 */
export const selectHandleBlur = (
  executeBlur: ReturnType<typeof selectExecuteBlur>
) =>
  ((eventOrPath: string | React.FocusEvent<any>): HandleBlurEventFn | void => {
    if (isString(eventOrPath)) {
      return (event: React.FocusEvent<any>) => executeBlur(event, eventOrPath);
    } else {
      return executeBlur(eventOrPath);
    }
  }) as HandleBlurFn;

export type SubmitFormFn = () => Promise<any>;

export const selectSubmitForm = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: AnyDispatch<Values>,
  validateForm: ValidateFormFn<Values>,
  executeSubmit: () => void | Promise<any>,
  isMounted: React.MutableRefObject<boolean>
): SubmitFormFn => () => {
  dispatch({ type: 'SUBMIT_ATTEMPT' });

  return validateForm(getState().values).then(
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
};

export type HandleSubmitFn = (
  e?: React.FormEvent<HTMLFormElement> | undefined
) => void;

export const selectHandleSubmit = (
  submitForm: SubmitFormFn
): HandleSubmitFn => (e?: React.FormEvent<HTMLFormElement>) => {
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
    if (activeElement !== null && activeElement instanceof HTMLButtonElement) {
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
};

export type GetFieldPropsFn = <Value extends any>(
  nameOrOptions: any
) => FieldInputProps<Value>;

export const selectGetFieldProps = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  handleChange: HandleChangeFn,
  handleBlur: ReturnType<typeof selectHandleBlur>,
  setFieldValue: SetFieldValueFn<Values>,
  getValueFromEvent: ReturnType<typeof selectGetValueFromEvent>
): GetFieldPropsFn => <V>(nameOrOptions: any): FieldInputProps<V> => {
  const state = getState();
  const isAnObject = isObject(nameOrOptions);
  const name = isAnObject
    ? nameOrOptions.name
      ? nameOrOptions.name
      : nameOrOptions.id
    : nameOrOptions;
  const valueState = getIn(state.values, name);
  const touchedState = getIn(state.touched, name);

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
      parse = /number|range/.test(type) ? numberParseFn : defaultParseFn,
      format = defaultFormatFn,
      formatOnBlur = false,
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

    if (type !== 'radio' && type !== 'checkbox' && !!format) {
      if (formatOnBlur === true) {
        if (touchedState === true) {
          field.value = format(field.value);
        }
      } else {
        field.value = format(field.value);
      }
    }

    // We incorporate the fact that we know the `name` prop by scoping `onChange`.
    // In addition, to support `parse` fn, we can't just re-use the OG `handleChange`, but
    // instead re-implement it's guts.
    if (type !== 'radio' && type !== 'checkbox') {
      field.onChange = (eventOrValue: React.ChangeEvent<any> | any) => {
        if (isInputEvent(eventOrValue)) {
          if (eventOrValue.persist) {
            eventOrValue.persist();
          }
          setFieldValue(name, parse(getValueFromEvent(eventOrValue, name)));
        } else {
          setFieldValue(name, parse(eventOrValue));
        }
      };
    }
  }
  return field;
};

export type GetFieldMetaFn = <Value extends any>(
  name: string
) => FieldMetaProps<Value>;

export const selectFieldMeta = <Values extends FormikValues>(
  name: string,
  refs: FormikRefs<Values>
) => (state: FormikState<Values>) => ({
  value: getIn(state.values, name),
  error: getIn(state.errors, name),
  touched: !!getIn(state.touched, name),
  initialValue: getIn(refs.initialValues.current, name),
  initialTouched: !!getIn(refs.initialTouched.current, name),
  initialError: getIn(refs.initialErrors.current, name),
});

export const selectGetFieldMeta = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  refs: FormikRefs<Values>
): GetFieldMetaFn => name => {
  return selectFieldMeta(name, refs)(getState());
};

export type GetFieldHelpersFn = <Value extends any>(
  name: string
) => FieldHelperProps<Value>;

export const selectGetFieldHelpers = <Values extends FormikValues>(
  setFieldValue: SetFieldValueFn<Values>,
  setFieldTouched: SetFieldTouchedFn<Values>,
  setFieldError: SetFieldErrorFn
) => (name: string): FieldHelperProps<any> => {
  return {
    setValue: (value: any, shouldValidate?: boolean) =>
      setFieldValue(name, value, shouldValidate),
    setTouched: (value: boolean, shouldValidate?: boolean) =>
      setFieldTouched(name, value, shouldValidate),
    setError: (value: any) => setFieldError(name, value),
  };
};

export type GetValueFromEventFn = (
  event: React.SyntheticEvent<any>,
  fieldName: string
) => any;

/**
 * @param isReactNative we should remove this param, and instead override this function in formik-native
 */
export const selectGetValueFromEvent = <Values extends FormikValues>(
  getState: GetStateFn<Values>
): GetValueFromEventFn => (event, fieldName) => {
  // React Native/Expo Web/maybe other render envs
  if (
    !isReactNative &&
    event.nativeEvent &&
    (event.nativeEvent as any).text !== undefined
  ) {
    return (event.nativeEvent as any).text;
  }

  // React Native
  if (isReactNative && event.nativeEvent) {
    return (event.nativeEvent as any).text;
  }

  const target = event.target ? event.target : event.currentTarget;
  const { type, value, checked, options, multiple } = target;

  return /checkbox/.test(type) // checkboxes
    ? getValueForCheckbox(getIn(getState().values, fieldName), checked, value)
    : !!multiple // <select multiple>
    ? getSelectedValues(options)
    : value;
};
