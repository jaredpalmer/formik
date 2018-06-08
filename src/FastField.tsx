import * as React from 'react';
import isEqual from 'react-fast-compare';
import warning from 'warning';
import { polyfill } from 'react-lifecycles-compat';
import { FieldAttributes, FieldConfig, FieldProps } from './Field';
import { validateYupSchema, yupToFormErrors } from './Formik';
import { connect } from './connect';
import { FormikContext } from './types';
import { getIn, isEmptyChildren, isFunction, isPromise, setIn } from './utils';

export interface FastFieldState {
  value: any;
  error?: string;
  warning?: string;
}

/** @private Returns whether two objects are deeply equal **excluding** a key / dot path */
function isEqualExceptForKey(a: any, b: any, path: string) {
  return isEqual(setIn(a, path, undefined), setIn(b, path, undefined));
}

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
class FastFieldInner<Props = {}, Values = {}> extends React.Component<
  FieldAttributes<Props> & { formik: FormikContext<Values> },
  FastFieldState
> {
  reset: (nextValues?: any) => void;

  static getDerivedStateFromProps(
    nextProps: any /* FieldAttributes<Props> & { formik: FormikContext<Values> }*/,
    prevState: FastFieldState
  ) {
    const nextFieldValue = getIn(nextProps.formik.values, nextProps.name);
    const nextFieldError = getIn(nextProps.formik.errors, nextProps.name);

    let nextState = null;
    if (!isEqual(nextFieldValue, prevState.value)) {
      nextState = { ...prevState, value: nextFieldValue };
    }

    if (!isEqual(nextFieldError, prevState.error)) {
      nextState = { ...prevState, error: nextFieldError };
    }

    return nextState;
  }

  constructor(
    props: FieldAttributes<Props> & { formik: FormikContext<Values> }
  ) {
    super(props);
    this.state = {
      value: getIn(props.formik.values, props.name),
      error: getIn(props.formik.errors, props.name),
      warning: getIn(props.formik.warnings, props.name),
    };

    this.reset = (nextValues?: any) => {
      this.setState({
        value: getIn(nextValues, props.name),
        error: getIn(props.formik.errors, props.name),
        warning: getIn(props.formik.warnings, props.name),
      });
    };

    props.formik.registerField(props.name, this.reset);

    const { render, children, component } = props;

    warning(
      !(component && render),
      'You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored'
    );

    warning(
      !(props.component && children && isFunction(children)),
      'You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.'
    );

    warning(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored'
    );
  }

  componentWillUnmount() {
    this.props.formik.unregisterField(this.props.name);
  }

  handleChange = (e: React.ChangeEvent<any>) => {
    e.persist();
    const {
      validateOnChange,
      validate,
      warnOnChange,
      warn,
      values,
      validationSchema,
      errors,
      warnings,
      setFormikState,
    } = this.props.formik;
    const { type, value, checked } = e.target;
    const val = /number|range/.test(type)
      ? parseFloat(value)
      : /checkbox/.test(type) ? checked : value;

    if (warnOnChange) {
      // Field-level validation
      if (this.props.warn) {
        const maybePromise = (this.props.warn as any)(value);
        if (isPromise(maybePromise)) {
          this.setState({ value: val });
          (maybePromise as any).then(
            () => this.setState({ warning: undefined }),
            (warning: string) => this.setState({ warning })
          );
        } else {
          this.setState({ value: val, warning: maybePromise });
        }
      } else if (warn) {
        // Top-level validate
        const maybePromise = (warn as any)(setIn(values, this.props.name, val));

        if (isPromise(maybePromise)) {
          this.setState({ value: val });
          (maybePromise as any).then(
            () => this.setState({ warning: undefined }),
            (warning: any) => {
              // Here we diff the warnings object relative to Formik parents except for
              // the Field's key. If they are equal, the field's validation function is
              // has no inter-field side-effects and we only need to update local state
              // otherwise we need to lift up the update to the parent (causing a full form render)
              if (
                isEqualExceptForKey(maybePromise, warnings, this.props.name)
              ) {
                this.setState({ error: getIn(warning, this.props.name) });
              } else {
                setFormikState((prevState: any) => ({
                  ...prevState,
                  warnings: warning,
                  // touched: setIn(prevState.touched, name, true),
                }));
              }
            }
          );
        } else {
          // Handle the same diff situation
          // @todo refactor
          if (isEqualExceptForKey(maybePromise, errors, this.props.name)) {
            this.setState({
              value: val,
              error: getIn(maybePromise, this.props.name),
            });
          } else {
            this.setState({
              value: val,
            });
            setFormikState((prevState: any) => ({
              ...prevState,
              errors: maybePromise,
            }));
          }
        }
      }
    }

    if (validateOnChange) {
      // Field-level validation
      if (this.props.validate) {
        const maybePromise = (this.props.validate as any)(value);
        if (isPromise(maybePromise)) {
          this.setState({ value: val });
          (maybePromise as any).then(
            () => this.setState({ error: undefined }),
            (error: string) => this.setState({ error })
          );
        } else {
          this.setState({ value: val, error: maybePromise });
        }
      } else if (validate) {
        // Top-level validate
        const maybePromise = (validate as any)(
          setIn(values, this.props.name, val)
        );

        if (isPromise(maybePromise)) {
          this.setState({ value: val });
          (maybePromise as any).then(
            () => this.setState({ error: undefined }),
            (error: any) => {
              // Here we diff the errors object relative to Formik parents except for
              // the Field's key. If they are equal, the field's validation function is
              // has no inter-field side-effects and we only need to update local state
              // otherwise we need to lift up the update to the parent (causing a full form render)
              if (isEqualExceptForKey(maybePromise, errors, this.props.name)) {
                this.setState({ error: getIn(error, this.props.name) });
              } else {
                setFormikState((prevState: any) => ({
                  ...prevState,
                  errors: error,
                  // touched: setIn(prevState.touched, name, true),
                }));
              }
            }
          );
        } else {
          // Handle the same diff situation
          // @todo refactor
          if (isEqualExceptForKey(maybePromise, errors, this.props.name)) {
            this.setState({
              value: val,
              error: getIn(maybePromise, this.props.name),
            });
          } else {
            this.setState({
              value: val,
            });
            setFormikState((prevState: any) => ({
              ...prevState,
              errors: maybePromise,
            }));
          }
        }
      } else if (validationSchema) {
        // Top-level validationsSchema
        const schema = isFunction(validationSchema)
          ? validationSchema()
          : validationSchema;
        const mergedValues = setIn(values, this.props.name, val);
        // try to validate with yup synchronously if possible...saves a render.
        try {
          validateYupSchema(mergedValues, schema, true);
          this.setState({
            value: val,
            error: undefined,
          });
        } catch (e) {
          if (e.name === 'ValidationError') {
            this.setState({
              value: val,
              error: getIn(yupToFormErrors(e), this.props.name),
            });
          } else {
            this.setState({
              value: val,
            });
            // try yup async validation
            validateYupSchema(mergedValues, schema).then(
              () => this.setState({ error: undefined }),
              (err: any) =>
                this.setState(s => ({
                  ...s,
                  error: getIn(yupToFormErrors(err), this.props.name),
                }))
            );
          }
        }
      } else {
        this.setState({ value: val });
      }
    } else {
      this.setState({ value: val });
    }
  };

  handleBlur = () => {
    const { validateOnBlur, warnOnBlur, setFormikState } = this.props.formik;
    const { name, validate, warn } = this.props;

    // @todo refactor
    if (warnOnBlur && warn) {
      const maybePromise = (warn as any)(this.state.value);
      if (isPromise(maybePromise)) {
        (maybePromise as Promise<any>).then(
          () =>
            setFormikState((prevState: any) => ({
              ...prevState,
              values: setIn(prevState.values, name, this.state.value),
              warnings: setIn(prevState.warnings, name, undefined),
              touched: setIn(prevState.touched, name, true),
            })),
          warning =>
            setFormikState((prevState: any) => ({
              ...prevState,
              values: setIn(prevState.values, name, this.state.value),
              warnings: setIn(prevState.warnings, name, warning),
              touched: setIn(prevState.touched, name, true),
            }))
        );
      } else {
        setFormikState((prevState: any) => ({
          ...prevState,
          values: setIn(prevState.values, name, this.state.value),
          warnings: setIn(prevState.warnings, name, maybePromise),
          touched: setIn(prevState.touched, name, true),
        }));
      }
    }

    if (validateOnBlur && validate) {
      const maybePromise = (validate as any)(this.state.value);
      if (isPromise(maybePromise)) {
        (maybePromise as Promise<any>).then(
          () =>
            setFormikState((prevState: any) => ({
              ...prevState,
              values: setIn(prevState.values, name, this.state.value),
              errors: setIn(prevState.errors, name, undefined),
              touched: setIn(prevState.touched, name, true),
            })),
          error =>
            setFormikState((prevState: any) => ({
              ...prevState,
              values: setIn(prevState.values, name, this.state.value),
              errors: setIn(prevState.errors, name, error),
              touched: setIn(prevState.touched, name, true),
            }))
        );
      } else {
        setFormikState((prevState: any) => ({
          ...prevState,
          values: setIn(prevState.values, name, this.state.value),
          errors: setIn(prevState.errors, name, maybePromise),
          touched: setIn(prevState.touched, name, true),
        }));
      }
    } else {
      setFormikState((prevState: any) => ({
        ...prevState,
        errors: setIn(prevState.errors, name, this.state.error),
        values: setIn(prevState.values, name, this.state.value),
        touched: setIn(prevState.touched, name, true),
      }));
    }
  };

  render() {
    const {
      validate,
      warn,
      name,
      render,
      children,
      component = 'input',
      formik,
      ...props
    } = this.props as FieldConfig & { formik: FormikContext<Values> };
    const {
      validate: _validate,
      warn: _warn,
      validationSchema: _validationSchema,
      ...restOfFormik
    } = formik;
    const field = {
      value:
        props.type === 'radio' || props.type === 'checkbox'
          ? props.value // React uses checked={} for these inputs
          : this.state.value,
      name,
      onChange: this.handleChange,
      onBlur: this.handleBlur,
    };
    const bag = {
      field,
      form: restOfFormik,
      meta: {
        touched: getIn(formik.touched, name),
        error: this.state.error,
        warning: this.state.warning,
      },
    };

    if (render) {
      return (render as (
        props: FieldProps<any> & {
          meta: { error?: string; warning?: string; touched?: boolean };
        }
      ) => React.ReactNode)(bag);
    }

    if (isFunction(children)) {
      return (children as (props: FieldProps<any>) => React.ReactNode)(bag);
    }

    if (typeof component === 'string') {
      const { innerRef, ...rest } = props;
      return React.createElement(component as any, {
        ref: innerRef,
        ...field,
        ...rest,
        children,
      });
    }

    return React.createElement(component as any, {
      ...bag,
      ...props,
      children,
    });
  }
}

export const FastField = connect<FieldAttributes<any>, any>(
  polyfill(FastFieldInner)
);
