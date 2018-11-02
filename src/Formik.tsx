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
import { isFunction, isString, setIn, isEmptyChildren } from './utils';
import { FormikProvider } from './FormikContext';

const defer = (cb?: () => void) => Promise.resolve().then(cb);

// We already used FormikActions. So we'll go all Elm-y, and use Message.
type FormikMessage<Values> =
  | { type: 'SUBMIT_ATTEMPT' }
  | { type: 'SUBMIT_FAILURE'; payload: FormikErrors<Values> }
  | { type: 'SUBMIT_SUCESS' }
  | { type: 'SET_ISVALIDATING'; payload: boolean }
  | { type: 'SET_ISSUBMITTING'; payload: boolean }
  | { type: 'SET_VALUES'; payload: Values }
  | { type: 'SET_TOUCHED'; payload: FormikTouched<Values> }
  | { type: 'SET_ERRORS'; payload: FormikErrors<Values> }
  | { type: 'SET_STATUS'; payload: any }
  | { type: 'SET_FORMIK_STATE'; payload: FormikState<Values> };

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
    case 'SET_FORMIK_STATE':
      return { ...state, ...msg.payload };
    default:
      return state;
  }
}

export function useFormik<Values = object, ExtraProps = {}>(
  props: FormikConfig<Values> & ExtraProps
) {
  const initialValues = React.useRef(props.initialValues);
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
        type: 'SET_TOUCHED',
        payload: setIn(state.touched, field, true),
      });

      if (props.validateOnBlur) {
        defer(() => {
          runValidations(state.values);
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
        const nextValues = setIn(state.values, field!, val);
        dispatch({ type: 'SET_VALUES', payload: nextValues });
        if (props.validateOnChange) {
          defer(() => {
            runValidations(nextValues);
          });
        }
      }
    }
  }

  function handleReset() {
    throw new Error('not yet implemented');
  }

  function handleSubmit() {
    throw new Error('not yet implemented');
  }

  function resetForm() {
    throw new Error('not yet implemented');
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

  function setFieldError(field: string, message: string | undefined) {
    dispatch({
      type: 'SET_ERRORS',
      payload: setIn(state.errors, field, message),
    });
  }

  function setFieldValue(
    field: string,
    value: any,
    shouldValidate: boolean = true
  ) {
    const nextValues = setIn(state.values, field, value);
    dispatch({
      type: 'SET_VALUES',
      payload: nextValues,
    });
    if (props.validateOnChange && shouldValidate) {
      defer(() => {
        runValidations(state.values);
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
        runValidations(state.values);
      });
    }
  }

  function runValidations(values: Values) {
    return;
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
    throw new Error('not yet implemented');
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
