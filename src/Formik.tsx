import * as React from 'react';
import isEqual from 'react-fast-compare';
import warning from 'warning';
import { FormikProvider } from './connect';
import {
  FormikActions,
  FormikConfig,
  FormikErrors,
  FormikState,
  FormikTouched,
  FormikValues,
  FormikContext,
} from './types';
import {
  isEmptyChildren,
  isFunction,
  isNaN,
  isPromise,
  isString,
  setIn,
  setNestedObjectValues,
} from './utils';

/**
 * We should use a constant enum here, but we don't for compat with Babel 7 TypeScript
 */

export enum FormikConstants {
  SUBMIT_FORM = 'SUBMIT_FORM',
  VALIDATE_ATTEMPT = 'VALIDATE_ATTEMPT',
  VALIDATE_FAILURE = 'VALIDATE_FAILURE',
  VALIDATE_SUCCESS = 'VALIDATE_SUCCESS',
  RESET_FORM = 'RESET_FORM',
  SET_FORMIK_STATE = 'SET_FORMIK_STATE',
  SET_FIELD_VALUE = 'SET_FIELD_VALUE',
  SET_FIELD_ERROR = 'SET_FIELD_ERROR',
  SET_FIELD_TOUCHED = 'SET_FIELD_TOUCHED',
  SET_VALUES = 'SET_VALUES',
  SET_TOUCHED = 'SET_TOUCHED',
  SET_ERRORS = 'SET_ERRORS',
  SET_STATUS = 'SET_STATUS',
  SET_SUBMITTING = 'SET_SUBMITTING',
}

export type Actions<Values> =
  | {
      type: FormikConstants.SUBMIT_FORM;
    }
  | {
      type: FormikConstants.VALIDATE_ATTEMPT;
    }
  | {
      type: FormikConstants.VALIDATE_SUCCESS;
    }
  | {
      type: FormikConstants.VALIDATE_FAILURE;
      payload: FormikErrors<Values>;
    }
  | {
      type: FormikConstants.RESET_FORM;
      payload?: FormikValues;
    }
  | {
      type: FormikConstants.SET_FORMIK_STATE;
      payload: FormikState<Values>;
    }
  | {
      type: FormikConstants.SET_SUBMITTING;
      payload: boolean;
    }
  | {
      type: FormikConstants.SET_FIELD_VALUE;
      payload: { field: string; value: any };
    }
  | {
      type: FormikConstants.SET_FIELD_ERROR;
      payload: { field: string; value?: string };
    }
  | {
      type: FormikConstants.SET_FIELD_TOUCHED;
      payload: { field: string; value: boolean };
    }
  | {
      type: FormikConstants.SET_VALUES;
      payload: FormikValues;
    }
  | {
      type: FormikConstants.SET_TOUCHED;
      payload: FormikTouched<Values>;
    }
  | {
      type: FormikConstants.SET_STATUS;
      payload?: any;
    }
  | {
      type: FormikConstants.SET_ERRORS;
      payload: FormikErrors<Values>;
    };

export class Formik<ExtraProps = {}, Values = object> extends React.Component<
  FormikConfig<Values> & ExtraProps,
  FormikState<Values>
> {
  static defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
    isInitialValid: false,
    enableReinitialize: false,
    reducer: (_p: FormikState<any>, n: FormikState<any>, _a: Actions<any>) => n,
  };

  initialValues: Values;

  hcCache: {
    [key: string]: (e: string | React.ChangeEvent<any>) => void;
  } = {};
  hbCache: {
    [key: string]: (e: any) => void;
  } = {};
  fields: { [field: string]: (nextValues?: any) => void };

  constructor(props: FormikConfig<Values> & ExtraProps) {
    super(props);
    this.state = {
      values: props.initialValues || ({} as any),
      errors: {},
      touched: {},
      isSubmitting: false,
      isValidating: false,
      submitCount: 0,
    };
    this.fields = {};
    this.initialValues = props.initialValues || ({} as any);

    warning(
      !(props.component && props.render),
      'You should not use <Formik component> and <Formik render> in the same <Formik> component; <Formik render> will be ignored'
    );

    warning(
      !(props.component && props.children && !isEmptyChildren(props.children)),
      'You should not use <Formik component> and <Formik children> in the same <Formik> component; <Formik children> will be ignored'
    );

    warning(
      !(props.render && props.children && !isEmptyChildren(props.children)),
      'You should not use <Formik render> and <Formik children> in the same <Formik> component; <Formik children> will be ignored'
    );
  }

  componentDidUpdate(prevProps: Readonly<FormikConfig<Values> & ExtraProps>) {
    // If the initialValues change, reset the form
    if (
      this.props.enableReinitialize &&
      !isEqual(prevProps.initialValues, this.props.initialValues)
    ) {
      this.initialValues = this.props.initialValues;
      // @todo refactor to use getDerivedStateFromProps?
      this.resetForm(this.props.initialValues);
    }
  }

  reducer = (
    state: FormikState<Values>,
    props: FormikConfig<Values> & ExtraProps,
    action: Actions<Values>
  ) => {
    switch (action.type) {
      case FormikConstants.VALIDATE_ATTEMPT:
        return {
          ...state,
          isValidating: true,
        };
      case FormikConstants.VALIDATE_FAILURE:
        return {
          ...state,
          isValidating: false,
          errors: action.payload,
        };
      case FormikConstants.VALIDATE_SUCCESS:
        return {
          ...state,
          isValidating: false,
          errors: {},
        };
      case FormikConstants.SET_VALUES:
        return { ...state, values: action.payload };
      case FormikConstants.SET_ERRORS:
        return { ...state, errors: action.payload };
      case FormikConstants.SET_TOUCHED:
        return { ...state, touched: action.payload };
      case FormikConstants.SET_STATUS:
        return { ...state, status: action.payload };
      case FormikConstants.SET_SUBMITTING:
        return { ...state, isSubmitting: action.payload };
      case FormikConstants.SET_FORMIK_STATE:
        return action.payload;
      case FormikConstants.SET_FIELD_VALUE:
        return {
          ...state,
          values: setIn(
            state.values,
            action.payload.field,
            action.payload.value
          ),
        };
      case FormikConstants.SET_FIELD_ERROR:
        return {
          ...state,
          values: setIn(
            state.errors,
            action.payload.field,
            action.payload.value
          ),
        };
      case FormikConstants.SET_FIELD_TOUCHED:
        return {
          ...state,
          values: setIn(
            state.touched,
            action.payload.field,
            action.payload.value
          ),
        };
      default:
        return state;
    }
  };

  dispatch = (action: Actions<Values>, cb?: () => any) => {
    this.setState(
      (
        prevState: FormikState<Values>,
        props: FormikConfig<Values> & ExtraProps
      ) =>
        this.props.reducer!(
          prevState,
          this.reducer(prevState, props, action),
          action
        ),
      cb
    );
  };

  registerField = (name: string, resetFn: (nextValues?: any) => void) => {
    this.fields[name] = resetFn;
  };

  unregisterField = (name: string) => {
    delete this.fields[name];
  };

  setErrors = (payload: FormikErrors<Values>) => {
    this.dispatch({ type: FormikConstants.SET_ERRORS, payload });
  };

  setTouched = (payload: FormikTouched<Values>) => {
    this.dispatch({ type: FormikConstants.SET_TOUCHED, payload }, () => {
      if (this.props.validateOnBlur) {
        this.runValidations(this.state.values);
      }
    });
  };

  setValues = (payload: Values) => {
    this.dispatch({ type: FormikConstants.SET_VALUES, payload }, () => {
      if (this.props.validateOnChange) {
        this.runValidations(this.state.values);
      }
    });
  };

  setStatus = (payload?: any) => {
    this.dispatch({ type: FormikConstants.SET_STATUS, payload });
  };

  setSubmitting = (payload: boolean) => {
    this.dispatch({ type: FormikConstants.SET_SUBMITTING, payload });
  };

  /**
   * Run validation against a Yup schema and optionally run a function if successful
   */
  runValidationSchema = (values: FormikValues, onSuccess?: Function) => {
    const { validationSchema } = this.props;
    const schema = isFunction(validationSchema)
      ? validationSchema()
      : validationSchema;

    validateYupSchema(values, schema).then(
      () => {
        this.dispatch({ type: FormikConstants.VALIDATE_SUCCESS });
        if (onSuccess) {
          onSuccess();
        }
      },
      (err: any) =>
        this.dispatch({
          type: FormikConstants.VALIDATE_FAILURE,
          payload: yupToFormErrors(err),
        })
    );
  };

  /**
   * Run validations and update state accordingly
   */
  runValidations = (values: FormikValues = this.state.values) => {
    this.dispatch({ type: FormikConstants.VALIDATE_ATTEMPT });

    if (this.props.validationSchema) {
      this.runValidationSchema(values);
    }

    if (this.props.validate) {
      const maybePromisedErrors = (this.props.validate as any)(values);
      if (isPromise(maybePromisedErrors)) {
        (maybePromisedErrors as Promise<any>).then(
          () => {
            this.dispatch({ type: FormikConstants.VALIDATE_SUCCESS });
          },
          errors =>
            this.dispatch({
              type: FormikConstants.VALIDATE_FAILURE,
              payload: errors,
            })
        );
      } else if (!!maybePromisedErrors) {
        this.dispatch({
          type: FormikConstants.VALIDATE_FAILURE,
          payload: maybePromisedErrors,
        });
      } else {
        this.dispatch({ type: FormikConstants.VALIDATE_SUCCESS });
      }
    }
  };

  handleChange = (
    eventOrPath: string | React.ChangeEvent<any>
  ): void | ((eventOrTextValue: string | React.ChangeEvent<any>) => void) => {
    // @todo someone make this less disgusting.
    //
    // executeChange is the core of handleChange, we'll use it cache change
    // handlers like Preact's linkState.
    const executeChange = (
      eventOrTextValue: string | React.ChangeEvent<any>,
      maybePath?: string
    ) => {
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
        this.dispatch({
          type: FormikConstants.SET_FIELD_VALUE,
          payload: {
            field,
            value: val,
          },
        });

        if (this.props.validateOnChange) {
          this.runValidations(setIn(this.state.values, field, val));
        }
      }
    };

    // Actually execute logic above....
    // cache these handlers by key like Preact's linkState does for perf boost
    if (isString(eventOrPath)) {
      return isFunction(this.hcCache[eventOrPath])
        ? this.hcCache[eventOrPath] // return the cached handled
        : (this.hcCache[eventOrPath] = (
            // make a new one
            event: React.ChangeEvent<any> | string
          ) =>
            executeChange(
              event /* string or event, does not matter */,
              eventOrPath /* this is path to the field now */
            ));
    } else {
      executeChange(eventOrPath);
    }
  };

  setFieldValue = (
    field: string,
    value: any,
    shouldValidate: boolean = true
  ) => {
    // Set form field by name
    this.dispatch(
      {
        type: FormikConstants.SET_FIELD_VALUE,
        payload: { field, value },
      },
      () => {
        if (this.props.validateOnChange && shouldValidate) {
          this.runValidations(this.state.values);
        }
      }
    );
  };

  handleSubmit = (e: React.FormEvent<HTMLFormElement> | undefined) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    if (
      process.env.NODE_ENV !== 'production' &&
      document &&
      document.activeElement
    ) {
      const type =
        document.activeElement.attributes &&
        document.activeElement.attributes.getNamedItem('type');

      const submitTriggeredFromButtonWithType =
        document.activeElement instanceof HTMLButtonElement && type;

      warning(
        submitTriggeredFromButtonWithType,
        'You submitted a Formik form using a button with an unspecified type.  Most browsers default button elements to type="submit". If this is not a submit button please add type="button".'
      );
    }

    this.submitForm();
  };

  submitForm = () => {
    // Recursively set all values to `true`.
    this.setState(prevState => ({
      touched: setNestedObjectValues<FormikTouched<Values>>(
        prevState.values,
        true
      ),
      isSubmitting: true,
      submitCount: prevState.submitCount + 1,
    }));

    if (this.props.validate) {
      const maybePromisedErrors =
        (this.props.validate as any)(this.state.values) || {};
      if (isPromise(maybePromisedErrors)) {
        (maybePromisedErrors as Promise<any>).then(
          () => {
            this.setState({ errors: {} });
            this.executeSubmit();
          },
          errors => this.setState({ errors, isSubmitting: false })
        );
        return;
      } else {
        const isValid = Object.keys(maybePromisedErrors).length === 0;
        this.setState({
          errors: maybePromisedErrors as FormikErrors<Values>,
          isSubmitting: isValid,
        });

        // only submit if there are no errors
        if (isValid) {
          this.executeSubmit();
        }
      }
    } else if (this.props.validationSchema) {
      this.runValidationSchema(this.state.values, this.executeSubmit);
    } else {
      this.executeSubmit();
    }
  };

  executeSubmit = () => {
    this.props.onSubmit(this.state.values, this.getFormikActions());
  };

  handleBlur = (eventOrString: any): void | ((e: any) => void) => {
    const executeBlur = (e: any, path?: string) => {
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

      this.setState(prevState => ({
        touched: setIn(prevState.touched, field, true),
      }));

      if (this.props.validateOnBlur) {
        this.runValidations(this.state.values);
      }
    };

    if (isString(eventOrString)) {
      // cache these handlers by key like Preact's linkState does for perf boost
      return isFunction(this.hbCache[eventOrString])
        ? this.hbCache[eventOrString]
        : (this.hbCache[eventOrString] = (event: any) =>
            executeBlur(event, eventOrString));
    } else {
      executeBlur(eventOrString);
    }
  };

  setFieldTouched = (
    field: string,
    touched: boolean = true,
    shouldValidate: boolean = true
  ) => {
    // Set touched field by name
    this.setState(
      prevState => ({
        ...prevState,
        touched: setIn(prevState.touched, field, touched),
      }),
      () => {
        if (this.props.validateOnBlur && shouldValidate) {
          this.runValidations(this.state.values);
        }
      }
    );
  };

  setFieldError = (field: string, message: string) => {
    // Set form field by name
    this.setState(prevState => ({
      ...prevState,
      errors: setIn(prevState.errors, field, message),
    }));
  };

  resetForm = (nextValues?: Values) => {
    const values = nextValues ? nextValues : this.props.initialValues;

    this.initialValues = values;

    this.setState({
      isSubmitting: false,
      errors: {},
      touched: {},
      error: undefined,
      status: undefined,
      values,
      submitCount: 0,
    });
    Object.keys(this.fields).map(f => this.fields[f](values));
  };

  handleReset = () => {
    if (this.props.onReset) {
      const maybePromisedOnReset = (this.props.onReset as any)(
        this.state.values,
        this.getFormikActions()
      );

      if (isPromise(maybePromisedOnReset)) {
        (maybePromisedOnReset as Promise<any>).then(this.resetForm);
      } else {
        this.resetForm();
      }
    } else {
      this.resetForm();
    }
  };

  setFormikState = (s: any, callback?: (() => void)) =>
    this.setState(s, callback);

  getFormikActions = (): FormikActions<Values> => {
    return {
      resetForm: this.resetForm,
      submitForm: this.submitForm,
      validateForm: this.runValidations,
      setErrors: this.setErrors,
      setFieldError: this.setFieldError,
      setFieldTouched: this.setFieldTouched,
      setFieldValue: this.setFieldValue,
      setStatus: this.setStatus,
      setSubmitting: this.setSubmitting,
      setTouched: this.setTouched,
      setValues: this.setValues,
      setFormikState: this.setFormikState,
    };
  };

  getFormikComputedProps = () => {
    const { isInitialValid } = this.props;
    const dirty = !isEqual(this.initialValues, this.state.values);
    return {
      dirty,
      isValid: dirty
        ? this.state.errors && Object.keys(this.state.errors).length === 0
        : isInitialValid !== false && isFunction(isInitialValid)
          ? (isInitialValid as (props: this['props']) => boolean)(this.props)
          : (isInitialValid as boolean),
      initialValues: this.initialValues,
    };
  };

  getFormikBag = () => {
    return {
      ...this.state,
      ...this.getFormikActions(),
      ...this.getFormikComputedProps(),

      // FastField needs to communicate with Formik during resets
      registerField: this.registerField,
      unregisterField: this.unregisterField,
      handleBlur: this.handleBlur,
      handleChange: this.handleChange,
      handleReset: this.handleReset,
      handleSubmit: this.handleSubmit,
      validateOnChange: this.props.validateOnChange,
      validateOnBlur: this.props.validateOnBlur,
    };
  };

  getFormikContext = (): FormikContext<any> => {
    return {
      ...this.getFormikBag(),
      validationSchema: this.props.validationSchema,
      validate: this.props.validate,
    };
  };

  render() {
    const { component, render, children } = this.props;
    const props = this.getFormikBag();
    const ctx = this.getFormikContext();
    return (
      <FormikProvider value={ctx}>
        {component
          ? React.createElement(component as any, props)
          : render
            ? (render as any)(props)
            : children // children come last, always called
              ? typeof children === 'function'
                ? (children as any)(props)
                : !isEmptyChildren(children)
                  ? React.Children.only(children)
                  : null
              : null}
      </FormikProvider>
    );
  }
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
