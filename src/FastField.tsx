import * as PropTypes from 'prop-types';
import * as React from 'react';
import { getIn, isPromise } from './utils';

import { setIn, validateYupSchema, yupToFormErrors } from './formik';
import { isFunction, isEmptyChildren } from './utils';
import warning from 'warning';
import { FieldAttributes, FieldConfig, FieldProps } from './Field';
import isEqual from 'lodash.isequal';

export interface FastFieldState {
  value: any;
  error?: string;
  touched: boolean;
}

function diffObjectsExceptForKey(a: any, b: any, path: string) {
  return isEqual(setIn(a, path, undefined), setIn(b, path, undefined));
}

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
export class FastField<
  Props extends FieldAttributes = any
> extends React.Component<Props, FastFieldState> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    render: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
    validate: PropTypes.func,
  };

  reset: Function;
  constructor(props: Props, context: any) {
    super(props);
    this.state = {
      value: getIn(context.formik.values, props.name),
      error: getIn(context.formik.errors, props.name),
      touched: getIn(context.formik.touched, props.name),
    };

    this.reset = () =>
      this.setState({
        value: getIn(context.formik.values, props.name),
        error: getIn(context.formik.errors, props.name),
        touched: getIn(context.formik.touched, props.name),
      });

    context.formik.registerField(props.name, this.reset);
  }

  componentWillUnmount() {
    this.context.formik.unregisterField(this.props.name);
  }

  componentWillMount() {
    const { render, children, component } = this.props;

    warning(
      !(component && render),
      'You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored'
    );

    warning(
      !(this.props.component && children && isFunction(children)),
      'You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.'
    );

    warning(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored'
    );
  }

  handleChange = (e: React.ChangeEvent<any>) => {
    e.persist();
    const {
      validateOnChange,
      validate,
      values,
      validationSchema,
      errors,
    } = this.context.formik;
    const { type, value, checked } = e.target;
    const val = /number|range/.test(type)
      ? parseFloat(value)
      : /checkbox/.test(type) ? checked : value;
    if (validateOnChange) {
      // Field-level validation
      if (this.props.validate) {
        console.log('field-validate');
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
        console.log('validate');
        console.log(
          diffObjectsExceptForKey(maybePromise, errors, this.props.name)
        );
        if (isPromise(maybePromise)) {
          this.setState({ value: val });
          (maybePromise as any).then(
            () => this.setState({ error: undefined }),
            (error: any) =>
              this.setState({ error: getIn(error, this.props.name) })
          );
        } else {
          console.log(
            diffObjectsExceptForKey(maybePromise, errors, this.props.name)
          );
          this.setState({
            value: val,
            error: getIn(maybePromise, this.props.name),
          });
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
        console.log('no validate in ctx');
        this.setState({ value: val });
      }
    } else {
      console.log('no validate');
      this.setState({ value: val });
    }
  };

  handleBlur = () => {
    const { validateOnBlur, setFormikState } = this.context.formik;
    const { name, validate } = this.props;

    // @todo refactor
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
      name,
      render,
      children,
      component = 'input',
      ...props
    } = this.props as FieldConfig;

    const { formik } = this.context;
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
      form: formik,
      // @todo add types
      meta: { touched: getIn(formik.touched, name), error: this.state.error },
    };

    if (render) {
      return (render as any)(bag);
    }

    if (isFunction(children)) {
      return (children as (props: FieldProps<any>) => React.ReactNode)(bag);
    }

    if (typeof component === 'string') {
      return React.createElement(component as any, {
        ...field,
        ...props,
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
