import {
  FormikErrors,
  FormikTouched,
  FormikValues,
  FormikConfig,
  ValidationHandler,
  FieldRegistry,
  GetStateFn,
  FormikMessage,
  FormikHelpers,
  FormikState,
  AllValidationsHandler,
  FieldInputProps,
  SetFieldTouched,
} from './types';
import { isFunction, isEqual } from 'lodash';
import deepmerge from 'deepmerge';
import { unstable_runWithPriority, unstable_LowPriority } from 'scheduler';
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
  isSyntheticEvent,
  getValueForCheckbox,
  getSelectedValues,
} from './utils';
import { emptyErrors } from './constants';
import invariant from 'tiny-warning';

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
    resolve(fieldRegistry.current[field].validate(value))
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

export const selectValidateFormWithLowPriorities = <
  Values extends FormikValues
>(
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
};
export const selectValidateFormWithHighPriority = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  runAllValidations: ValidationHandler<Values>,
  isMounted: React.MutableRefObject<boolean>
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
};

export const selectResetForm = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  initialErrors: FormikConfig<Values>['initialErrors'],
  initialTouched: FormikConfig<Values>['initialTouched'],
  initialStatus: FormikConfig<Values>['initialStatus'],
  onReset: FormikConfig<Values>['onReset'],
  imperativeMethods: FormikHelpers<Values>
) => (nextState?: Partial<FormikState<Values>>) => {
  const values =
    nextState && nextState.values ? nextState.values : getState().initialValues;
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
    const maybePromisedOnReset = onReset(getState().values, imperativeMethods);

    if (isPromise(maybePromisedOnReset)) {
      maybePromisedOnReset.then(dispatchFn);
    } else {
      dispatchFn();
    }
  } else {
    dispatchFn();
  }
};

export const selectValidateField = <Values extends FormikValues>(
  fieldRegistry: React.MutableRefObject<FieldRegistry>,
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validationSchema: FormikConfig<Values>['validationSchema'],
  runValidationSchema: ValidationHandler<Values>
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
};

export const selectSetTouched = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateOnBlur: FormikConfig<Values>['validateOnBlur'],
  validateFormWithLowPriority: AllValidationsHandler<Values>
) => (touched: FormikTouched<Values>, shouldValidate?: boolean) => {
  dispatch({ type: 'SET_TOUCHED', payload: touched });
  const willValidate =
    shouldValidate === undefined ? validateOnBlur : shouldValidate;
  return willValidate
    ? validateFormWithLowPriority(getState().values)
    : Promise.resolve();
};

export const selectSetValues = <Values extends FormikValues>(
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateOnChange: FormikConfig<Values>['validateOnChange'],
  validateFormWithLowPriority: AllValidationsHandler<Values>
) => (values: Values, shouldValidate?: boolean) => {
  dispatch({ type: 'SET_VALUES', payload: values });
  const willValidate =
    shouldValidate === undefined ? validateOnChange : shouldValidate;
  return willValidate ? validateFormWithLowPriority(values) : Promise.resolve();
};

export const selectSetFieldError = <Values extends FormikValues>(
  dispatch: React.Dispatch<FormikMessage<Values>>
) => (field: string, value: string | undefined) => {
  dispatch({
    type: 'SET_FIELD_ERROR',
    payload: { field, value },
  });
};

export const selectSetFieldValue = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateOnChange: FormikConfig<Values>['validateOnChange'],
  validateFormWithLowPriority: AllValidationsHandler<Values>
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
    if (isSyntheticEvent(eventOrTextValue)) {
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
};

export const selectHandleChange = (
  executeChange: ReturnType<typeof selectExecuteChange>
) => (
  eventOrPath: string | React.ChangeEvent<any>
): void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void) => {
  if (isString(eventOrPath)) {
    return event => executeChange(event, eventOrPath);
  } else {
    executeChange(eventOrPath);
  }
};

export const selectSetFieldTouched = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateFormWithLowPriority: AllValidationsHandler<Values>,
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
};
export const selectSetFormikState = <Values extends FormikValues>(
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
};
type SubmitForm = () => Promise<any | void>;
export const selectSubmitForm = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  dispatch: React.Dispatch<FormikMessage<Values>>,
  validateFormWithHighPriority: ValidationHandler<Values>,
  executeSubmit: () => void | Promise<any>,
  isMounted: React.MutableRefObject<boolean>
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
};
export const selectExecuteBlur = <Values extends FormikValues>(
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
};

export const selectHandleBlur = (
  executeBlur: ReturnType<typeof selectExecuteBlur>
) => (eventOrString: any): void | ((e: any) => void) => {
  if (isString(eventOrString)) {
    return event => executeBlur(event, eventOrString);
  } else {
    executeBlur(eventOrString);
  }

  return;
};

export const selectHandleSubmit = (submitForm: SubmitForm) => (
  e?: React.FormEvent<HTMLFormElement>
) => {
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

export const selectGetFieldProps = <Values extends FormikValues>(
  getState: GetStateFn<Values>,
  handleChange: ReturnType<typeof selectHandleChange>,
  handleBlur: ReturnType<typeof selectHandleBlur>
) => (nameOrOptions: any): FieldInputProps<any> => {
  const state = getState();
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
};
