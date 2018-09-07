import * as React from 'react';
import isEqual from 'react-fast-compare';
import warning from 'warning';
import deepmerge from 'deepmerge';
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
  getActiveElement,
  getIn,
} from './utils';

export class Formik<Values = {}, ExtraProps = {}> extends React.Component<
  FormikConfig<Values> & ExtraProps,
  FormikState<any>
> {
  static defaultProps = {
    validateOnChange: true,
    validateOnBlur: true,
    isInitialValid: false,
    enableReinitialize: false,
  };

  initialValues: Values;
  didMount: boolean;
  hcCache: {
    [key: string]: (e: string | React.ChangeEvent<any>) => void;
  } = {};
  hbCache: {
    [key: string]: (e: any) => void;
  } = {};
  fields: {
    [field: string]: {
      validate?: ((value: any) => string | Promise<void> | undefined);
    };
  };

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
    this.didMount = false;
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

  registerField = (
    name: string,
    fns: {
      reset?: ((nextValues?: any) => void);
      validate?: ((value: any) => string | Promise<void> | undefined);
    }
  ) => {
    this.fields[name] = fns;
  };

  unregisterField = (name: string) => {
    delete this.fields[name];
  };

  componentDidMount() {
    this.didMount = true;
  }

  componentWillUnmount() {
    // This allows us to prevent setting state on an
    // unmounted component. This can occur if Formik is in a modal, and submission
    // toggles show/hide, and validation of a blur field takes longer than validation
    // before a submit.
    // @see https://github.com/jaredpalmer/formik/issues/597
    // @see https://reactjs.org/blog/2015/12/16/ismounted-antipattern.html
    this.didMount = false;
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

  setErrors = (errors: FormikErrors<Values>) => {
    this.setState({ errors });
  };

  setTouched = (touched: FormikTouched<Values>) => {
    this.setState({ touched }, () => {
      if (this.props.validateOnBlur) {
        this.runValidations(this.state.values);
      }
    });
  };

  setValues = (values: FormikValues) => {
    this.setState({ values }, () => {
      if (this.props.validateOnChange) {
        this.runValidations(values);
      }
    });
  };

  setStatus = (status?: any) => {
    this.setState({ status });
  };

  setError = (error: any) => {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `Warning: Formik\'s setError(error) is deprecated and may be removed in future releases. Please use Formik\'s setStatus(status) instead. It works identically. For more info see https://github.com/jaredpalmer/formik#setstatus-status-any--void`
      );
    }
    this.setState({ error });
  };

  setSubmitting = (isSubmitting: boolean) => {
    this.setState({ isSubmitting });
  };

  /**
   * Run field level validation
   */
  validateField = (field: string) => {
    this.setState({ isValidating: true });
    this.runSingleFieldLevelValidation(
      field,
      getIn(this.state.values, field)
    ).then(error => {
      if (this.didMount) {
        this.setState({
          errors: setIn(this.state.errors, field, error),
          isValidating: false,
        });
      }
    });
  };

  runSingleFieldLevelValidation = (
    field: string,
    value: void | string
  ): Promise<string> => {
    return new Promise(resolve =>
      resolve(this.fields[field].validate!(value))
    ).then(x => x, e => e);
  };

  runFieldLevelValidations(
    values: FormikValues
  ): Promise<FormikErrors<Values>> {
    const fieldKeysWithValidation: string[] = Object.keys(this.fields).filter(
      f =>
        this.fields &&
        this.fields[f] &&
        this.fields[f].validate &&
        isFunction(this.fields[f].validate)
    );

    // Construct an array with all of the field validation functions
    const fieldValidations: Promise<string>[] =
      fieldKeysWithValidation.length > 0
        ? fieldKeysWithValidation.map(f =>
            this.runSingleFieldLevelValidation(f, getIn(values, f))
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

  runValidateHandler(values: FormikValues): Promise<FormikErrors<Values>> {
    return new Promise(resolve => {
      const maybePromisedErrors = (this.props.validate as any)(values);
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
  runValidationSchema = (values: FormikValues) => {
    return new Promise(resolve => {
      const { validationSchema } = this.props;
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
  };

  /**
   * Run all validations methods and update state accordingly
   */
  runValidations = (
    values: FormikValues = this.state.values
  ): Promise<FormikErrors<Values>> => {
    this.setState({ isValidating: true });
    return Promise.all([
      this.runFieldLevelValidations(values),
      this.props.validationSchema ? this.runValidationSchema(values) : {},
      this.props.validate ? this.runValidateHandler(values) : {},
    ]).then(([fieldErrors, schemaErrors, handlerErrors]) => {
      const combinedErrors = deepmerge.all<FormikErrors<Values>>(
        [fieldErrors, schemaErrors, handlerErrors],
        { arrayMerge }
      );

      if (this.didMount) {
        this.setState({ isValidating: false, errors: combinedErrors });
      }

      return combinedErrors;
    });
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
        this.setState(prevState => ({
          ...prevState,
          values: setIn(prevState.values, field!, val),
        }));

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
    this.setState(
      prevState => ({
        ...prevState,
        values: setIn(prevState.values, field, value),
      }),
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

    return this.runValidations().then(combinedErrors => {
      const isValid = Object.keys(combinedErrors).length === 0;
      if (isValid) {
        this.executeSubmit();
      } else if (this.didMount) {
        // ^^^ Make sure Formik is still mounted before calling setState
        this.setState({ isSubmitting: false });
      }
    });
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

  setFieldError = (field: string, message: string | undefined) => {
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
      isValidating: false,
      errors: {},
      touched: {},
      error: undefined,
      status: undefined,
      values,
      submitCount: 0,
    });
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
      validateField: this.validateField,
      setError: this.setError,
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
      // Field needs to communicate with Formik during resets
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
