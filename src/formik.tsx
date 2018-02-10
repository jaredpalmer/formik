import * as React from 'react';
import isEqual from 'lodash.isequal';
import warning from 'warning';
import { FormikContext } from './connect';

import {
  isFunction,
  isPromise,
  isReactNative,
  isEmptyChildren,
  setIn,
  setNestedObjectValues,
} from './utils';

import {
  FormikConfig,
  FormikState,
  FormikValues,
  FormikTouched,
  FormikErrors,
  FormikActions,
} from './types';

export class Formik<ExtraProps = {}, Values = object> extends React.Component<
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

  constructor(props: FormikConfig<Values> & ExtraProps) {
    super(props);
    this.state = {
      values: props.initialValues || ({} as any),
      errors: {},
      touched: {},
      isSubmitting: false,
    };

    this.initialValues = props.initialValues || ({} as any);
  }

  componentWillReceiveProps(
    nextProps: Readonly<FormikConfig<Values> & ExtraProps>
  ) {
    // If the initialValues change, reset the form
    if (
      this.props.enableReinitialize &&
      !isEqual(nextProps.initialValues, this.props.initialValues)
    ) {
      this.initialValues = nextProps.initialValues;
      this.resetForm(nextProps.initialValues);
    }
  }

  componentWillMount() {
    warning(
      !(this.props.component && this.props.render),
      'You should not use <Formik component> and <Formik render> in the same <Formik> component; <Formik render> will be ignored'
    );

    warning(
      !(
        this.props.component &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use <Formik component> and <Formik children> in the same <Formik> component; <Formik children> will be ignored'
    );

    warning(
      !(
        this.props.render &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use <Formik render> and <Formik children> in the same <Formik> component; <Formik children> will be ignored'
    );
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
   * Run validation against a Yup schema and optionally run a function if successful
   */
  runValidationSchema = (values: FormikValues, onSuccess?: Function) => {
    const { validationSchema } = this.props;
    const schema = isFunction(validationSchema)
      ? validationSchema()
      : validationSchema;
    validateYupSchema(values, schema).then(
      () => {
        this.setState({ errors: {} });
        if (onSuccess) {
          onSuccess();
        }
      },
      (err: any) =>
        this.setState({ errors: yupToFormErrors(err), isSubmitting: false })
    );
  };

  /**
   * Run validations and update state accordingly
   */
  runValidations = (values: FormikValues = this.state.values) => {
    if (this.props.validationSchema) {
      this.runValidationSchema(values);
    }

    if (this.props.validate) {
      const maybePromisedErrors = (this.props.validate as any)(values);
      if (isPromise(maybePromisedErrors)) {
        (maybePromisedErrors as Promise<any>).then(
          () => {
            this.setState({ errors: {} });
          },
          errors => this.setState({ errors, isSubmitting: false })
        );
      } else {
        this.setErrors(maybePromisedErrors as FormikErrors<Values>);
      }
    }
  };

  handleChange = (e: React.ChangeEvent<any>) => {
    if (isReactNative) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `Warning: Formik's handleChange does not work with React Native. Use setFieldValue and within a callback instead. For more info see https://github.com/jaredpalmer/formik#react-native`
        );
      }
      return;
    }
    e.persist();
    const { type, name, id, value, checked, outerHTML } = e.target;
    const field = name ? name : id;
    const val = /number|range/.test(type)
      ? parseFloat(value)
      : /checkbox/.test(type) ? checked : value;

    if (!field && process.env.NODE_ENV !== 'production') {
      warnAboutMissingIdentifier({
        htmlContent: outerHTML,
        documentationAnchorLink: 'handlechange-e-reactchangeeventany--void',
        handlerName: 'handleChange',
      });
    }

    // Set form fields by name
    this.setState(prevState => ({
      ...prevState,
      values: setIn(prevState.values, field, val),
    }));

    if (this.props.validateOnChange) {
      this.runValidations(setIn(this.state.values, field, val));
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

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.submitForm();
  };

  submitForm = () => {
    // Recursively set all values to `true`.
    this.setState({
      touched: setNestedObjectValues<FormikTouched<Values>>(
        this.state.values,
        true
      ),
      isSubmitting: true,
    });

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

  handleBlur = (e: any) => {
    if (isReactNative) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `Warning: Formik's handleBlur does not work with React Native. Use setFieldTouched(field, isTouched) within a callback instead. For more info see https://github.com/jaredpalmer/formik#setfieldtouched-field-string-istouched-boolean--void`
        );
      }
      return;
    }
    e.persist();
    const { name, id, outerHTML } = e.target;
    const field = name ? name : id;

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
    if (nextValues) {
      this.initialValues = nextValues;
    }

    this.setState({
      isSubmitting: false,
      errors: {},
      touched: {},
      error: undefined,
      status: undefined,
      values: nextValues ? nextValues : this.props.initialValues,
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
      handleBlur: this.handleBlur,
      handleChange: this.handleChange,
      handleReset: this.handleReset,
      handleSubmit: this.handleSubmit,
      validateOnChange: this.props.validateOnChange,
      validateOnBlur: this.props.validateOnBlur,
    };
  };

  render() {
    const { component, render, children } = this.props;
    const props = this.getFormikBag();
    return (
      <FormikContext.Provider value={props}>
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
      </FormikContext.Provider>
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
    `Warning: \`${handlerName}\` has triggered and you forgot to pass an \`id\` or \`name\` attribute to your input:

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
export function validateYupSchema<T>(
  data: T,
  schema: any,
  context: any = {}
): Promise<void> {
  let validateData: any = {};
  for (let k in data) {
    if (data.hasOwnProperty(k)) {
      const key = String(k);
      validateData[key] =
        (data as any)[key] !== '' ? (data as any)[key] : undefined;
    }
  }
  return schema.validate(validateData, { abortEarly: false, context: context });
}
