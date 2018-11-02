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
import warning from 'warning';

const defer = (cb?: () => void) => Promise.resolve().then(cb);

// We already used FormikActions. So we'll go all Elm-y, and use Message.
type FormikMessage<Values> =
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'SUBMIT_FAILURE' }
  | { type: 'SUBMIT_SUCESS' }
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
    case 'SET_ISVALIDATING':
      return { ...state, isValidating: msg.payload };
    case 'SET_ISSUBMITTING':
      return { ...state, isSubmitting: msg.payload };
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
    default:
      return state;
  }
}

export function useFormik<Values = object, ExtraProps = {}>(
  props: FormikConfig<Values> & ExtraProps
) {
  const initialValues = React.useRef(props.initialValues);

  const didMount = React.useRef<boolean>(false);
  React.useEffect(() => {
    didMount.current = true;
    return function unMount() {
      didMount.current = false;
    };
  }, []);

  const fields = React.useRef<{
    [field: string]: {
      validate: (value: any) => string | Promise<string> | undefined;
    };
  }>({});
  React.useEffect(
    () => {
      initialValues.current = props.initialValues;
    },
    [props.initialValues]
  );

  const [state, dispatch] = React.useReducer<
    FormikState<Values>,
    FormikMessage<Values>
  >(formikReducer, {
    values: props.initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValidating: false,
    submitCount: 0,
  });

  const imperativeMethods = {
    resetForm,
    submitForm,
    validateForm,
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

  function registerField(name: string, validate: any) {
    if (fields.current !== null) {
      fields.current[name] = {
        validate,
      };
    }
  }

  function unregisterField() {
    if (fields.current !== null) {
      delete fields.current[name];
    }
  }

  function handleBlur(eventOrString: any): void | ((e: any) => void) {
    if (isString(eventOrString)) {
      return event => executeBlur(event, eventOrString);
    } else {
      executeBlur(eventOrString);
    }

    function executeBlur(e: any, path?: string) {
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

      dispatch({
        type: 'SET_FIELD_TOUCHED',
        payload: { field, value: true },
      });

      if (props.validateOnBlur) {
        defer(() => {
          validateForm(state.values);
        });
      }
    }
  }

  function handleChange(
    eventOrPath: string | React.ChangeEvent<any>
  ): void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void) {
    if (isString(eventOrPath)) {
      return event => executeChange(event, eventOrPath);
    } else {
      executeChange(eventOrPath);
    }

    function executeChange(
      eventOrTextValue: string | React.ChangeEvent<any>,
      maybePath?: string
    ) {
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
          : /checkbox/.test(type) ? checked : value;
      }

      if (field) {
        // Set form fields by name
        dispatch({ type: 'SET_FIELD_VALUE', payload: { field, value: val } });
        if (props.validateOnChange) {
          defer(() => {
            validateForm(setIn(state.values, field!, val));
          });
        }
      }
    }
  }

  function handleReset() {
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
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement> | undefined) {
    if (e && e.preventDefault) {
      e.preventDefault();
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
        warning(
          !!(
            activeElement.attributes &&
            activeElement.attributes.getNamedItem('type')
          ),
          'You submitted a Formik form using a button with an unspecified `type` attribute.  Most browsers default button elements to `type="submit"`. If this is not a submit button, please add `type="button"`.'
        );
      }
    }

    submitForm();
  }

  function executeSubmit() {
    props.onSubmit(state.values, imperativeMethods);
  }

  function resetForm(nextValues?: Values) {
    const values = nextValues
      ? nextValues
      : initialValues.current !== null
        ? initialValues.current
        : props.initialValues;
    initialValues.current = values;
    dispatch({
      type: 'RESET_FORM',
      payload: {
        isSubmitting: false,
        isValidating: false,
        errors: {},
        touched: {},
        status: undefined,
        values,
        submitCount: 0,
      },
    });
  }

  function setTouched(touched: FormikTouched<Values>) {
    dispatch({ type: 'SET_TOUCHED', payload: touched });
  }

  function setErrors(errors: FormikErrors<Values>) {
    dispatch({ type: 'SET_ERRORS', payload: errors });
  }

  function setValues(values: Values) {
    dispatch({ type: 'SET_VALUES', payload: values });
  }

  function setFieldError(field: string, value: string | undefined) {
    dispatch({
      type: 'SET_FIELD_ERROR',
      payload: { field, value },
    });
  }

  function setFieldValue(
    field: string,
    value: any,
    shouldValidate: boolean = true
  ) {
    dispatch({
      type: 'SET_FIELD_VALUE',
      payload: {
        field,
        value,
      },
    });
    if (props.validateOnChange && shouldValidate) {
      defer(() => {
        validateForm(setIn(state.values, field, value));
      });
    }
  }

  function setFieldTouched(
    field: string,
    touched: boolean = true,
    shouldValidate: boolean = true
  ) {
    const nextTouched = setIn(state.touched, field, touched);
    dispatch({
      type: 'SET_TOUCHED',
      payload: nextTouched,
    });
    if (props.validateOnBlur && shouldValidate) {
      defer(() => {
        validateForm(state.values);
      });
    }
  }

  function validateField(name: string) {
    // This will efficiently validate a single field by avoiding state
    // changes if the validation function is synchronous. It's different from
    // what is called when using validateForm.
    if (
      fields.current !== null &&
      fields.current[name] &&
      fields.current[name].validate &&
      isFunction(fields.current[name].validate)
    ) {
      const value = getIn(state.values, name);
      const validateFn = fields.current[name].validate;
      if (isPromise(validateFn)) {
        // Only flip isValidating if the function is async.
        dispatch({ type: 'SET_ISVALIDATING', payload: true });
        return (validateFn as any)(value)
          .then((x: any) => x, (e: any) => e)
          .then((error: string) => {
            dispatch({
              type: 'SET_FIELD_ERROR',
              payload: { field: name, value: error },
            });
            dispatch({ type: 'SET_ISVALIDATING', payload: true });
          });
      } else {
        const error = validateFn(value);
        dispatch({
          type: 'SET_FIELD_ERROR',
          payload: {
            field: name,
            value: error as string | undefined,
          },
        });
        return Promise.resolve(error as string | undefined);
      }
    } else {
      return Promise.resolve();
    }
  }

  function runSingleFieldLevelValidationAsPromise(
    field: string,
    value: void | string
  ): Promise<string> {
    return new Promise(resolve => {
      if (
        fields.current !== null &&
        fields.current[name] &&
        fields.current[name].validate &&
        isFunction(fields.current[name].validate)
      ) {
        resolve(fields.current[field].validate(value));
      }
    }).then(x => x, e => e);
  }

  function runFieldLevelValidations(
    values: Values
  ): Promise<FormikErrors<Values>> {
    if (fields.current === null) {
      return Promise.resolve({});
    }
    const fieldKeysWithValidation: string[] = Object.keys(
      fields.current
    ).filter(
      f =>
        fields.current !== null &&
        fields.current[f] &&
        fields.current[f].validate &&
        isFunction(fields.current[f].validate)
    );

    // Construct an array with all of the field validation functions
    const fieldValidations: Promise<string>[] =
      fieldKeysWithValidation.length > 0
        ? fieldKeysWithValidation.map(f =>
            runSingleFieldLevelValidationAsPromise(f, getIn(values, f))
          )
        : [Promise.resolve('DO_NOT_DELETE_YOU_WILL_BE_FIRED')]; // use special case ;)

    return Promise.all(fieldValidations).then((fieldErrorsList: string[]) =>
      fieldErrorsList.reduce(
        (prev, curr, index) => {
          if (curr === 'DO_NOT_DELETE_YOU_WILL_BE_FIRED') {
            return prev;
          }
          if (!!curr) {
            prev = setIn(prev, fieldKeysWithValidation[index], curr);
          }
          return prev;
        },
        {} as FormikErrors<Values>
      )
    );
  }

  function runValidateHandler(values: Values): Promise<FormikErrors<Values>> {
    return new Promise(resolve => {
      const maybePromisedErrors = (props.validate as any)(values);
      if (maybePromisedErrors === undefined) {
        resolve({});
      } else if (isPromise(maybePromisedErrors)) {
        (maybePromisedErrors as Promise<any>).then(
          () => {
            resolve({});
          },
          errors => {
            resolve(errors);
          }
        );
      } else {
        resolve(maybePromisedErrors);
      }
    });
  }

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  function validateFormchema(values: Values) {
    return new Promise(resolve => {
      const { validationSchema } = props;
      const schema = isFunction(validationSchema)
        ? validationSchema()
        : validationSchema;
      validateYupSchema(values, schema).then(
        () => {
          resolve({});
        },
        (err: any) => {
          resolve(yupToFormErrors(err));
        }
      );
    });
  }

  /**
   * Run all validations methods and update state accordingly
   */
  function validateForm(
    values: Values = state.values
  ): Promise<FormikErrors<Values>> {
    dispatch({ type: 'SET_ISVALIDATING', payload: true });
    return Promise.all([
      runFieldLevelValidations(values),
      props.validationSchema ? validateFormchema(values) : {},
      props.validate ? runValidateHandler(values) : {},
    ]).then(([fieldErrors, schemaErrors, handlerErrors]) => {
      const combinedErrors = deepmerge.all<FormikErrors<Values>>(
        [fieldErrors, schemaErrors, handlerErrors],
        { arrayMerge }
      );

      if (didMount) {
        dispatch({ type: 'SET_ISVALIDATING', payload: true });
        dispatch({ type: 'SET_ERRORS', payload: combinedErrors });
      }

      return combinedErrors;
    });
  }

  function setFormikState<K extends keyof FormikState<Values>>(
    stateOrCb:
      | Pick<FormikState<Values>, K>
      | ((state: FormikState<Values>) => FormikState<Values>)
  ): void {
    if (isFunction(stateOrCb)) {
      dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb(state) });
    } else {
      dispatch({ type: 'SET_FORMIK_STATE', payload: stateOrCb });
    }
  }

  function setStatus(status: any) {
    dispatch({ type: 'SET_STATUS', payload: status });
  }

  function setSubmitting(isSubmitting: boolean) {
    dispatch({ type: 'SET_ISSUBMITTING', payload: isSubmitting });
  }

  function submitForm() {
    dispatch({ type: 'SUBMIT_ATTEMPT' });
    return validateForm().then((combinedErrors: FormikErrors<Values>) => {
      const isValid = Object.keys(combinedErrors).length === 0;
      if (isValid) {
        executeSubmit();
      } else if (didMount.current) {
        // ^^^ Make sure Formik is still mounted before calling setState
        dispatch({ type: 'SUBMIT_FAILURE' });
      }
    });
  }

  const dirty = React.useMemo(() => !isEqual(initialValues, state.values), [
    initialValues,
    state.values,
  ]);

  const isValid = React.useMemo(
    () =>
      dirty
        ? state.errors && Object.keys(state.errors).length === 0
        : props.isInitialValid !== false && isFunction(props.isInitialValid)
          ? (props.isInitialValid as (props: FormikConfig<Values>) => boolean)(
              props
            )
          : (props.isInitialValid as boolean),
    [state.errors, props.isInitialValid]
  );
  const ctx = {
    ...state,
    initialValues: initialValues.current || props.initialValues,
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
    isValid,
    dirty,
    unregisterField,
    registerField,
  };

  return ctx;
}

export function Formik<Values = object, ExtraProps = {}>(
  props: FormikConfig<Values> & ExtraProps
) {
  const formikbag = useFormik<Values, ExtraProps>(props);
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
  console.error(
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
  let errors: any = {} as FormikErrors<Values>;
  if (yupError.inner.length === 0) {
    return setIn(errors, yupError.path, yupError.message);
  }
  for (let err of yupError.inner) {
    if (!errors[err.path]) {
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
