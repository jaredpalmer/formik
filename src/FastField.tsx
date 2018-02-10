import * as PropTypes from 'prop-types';
import * as React from 'react';
import { getIn, isPromise } from './utils';

import { FormikProps, setIn } from './formik';
import { isFunction, isEmptyChildren } from './utils';
import warning from 'warning';
import { GenericFieldHTMLAttributes } from './types';

// tslint:disable-next-line:no-empty
const noop = () => {};

/**
 * Note: These typings could be more restrictive, but then it would limit the
 * reusability of custom <Field/> components.
 *
 * @example
 * interface MyProps {
 *   ...
 * }
 *
 * export const MyInput: React.SFC<MyProps & FieldProps> = ({
 *   field,
 *   form,
 *   ...props
 * }) =>
 *   <div>
 *     <input {...field} {...props}/>
 *     {form.touched[field.name] && form.errors[field.name]}
 *   </div>
 */
export interface FastFieldProps<V = any> {
  field: {
    /** Classic React change handler, keyed by input name */
    onChange: (e: React.ChangeEvent<any>) => void;
    /** Mark input as touched */
    onBlur: (e: any) => void;
    /** Value of the input */
    value: any;
    /* name of the input */
    name: string;
  };
  form: FormikProps<V>; // if ppl want to restrict this for a given form, let them.
}

export interface FastFieldConfig {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FastFieldProps<any>>
    | React.ComponentType<void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: FastFieldProps<any>) => React.ReactNode);

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FastFieldProps<any>) => React.ReactNode);

  /**
   * Validate a single field value independently
   */
  validate?: ((value: any) => string | Function | Promise<void> | undefined);

  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: any;
}

export type FastFieldAttributes = GenericFieldHTMLAttributes & FastFieldConfig;

export interface FastFieldState {
  value: any;
  error?: string;
  touched: boolean;
}
/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
export class FastField<
  Props extends FastFieldAttributes = any
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
      'You should not use <Field component> and <Field render> in the same <Field> component; <Field component> will be ignored'
    );

    warning(
      !(this.props.component && children && isFunction(children)),
      'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.'
    );

    warning(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
    );
  }

  handleChange = (e: React.ChangeEvent<any>) => {
    e.persist();
    const { validateOnChange } = this.context.formik;
    const { type, value, checked } = e.target;
    const val = /number|range/.test(type)
      ? parseFloat(value)
      : /checkbox/.test(type) ? checked : value;
    if (this.props.validate && validateOnChange) {
      const maybePromise = (this.props.validate as any)(value);
      if (isPromise(maybePromise)) {
        this.setState({ value: val });
        (maybePromise as any).then(noop, (error: string) =>
          this.setState({ error })
        );
      } else {
        this.setState({ value: val, error: maybePromise });
      }
    } else {
      this.setState({ value: val });
    }
  };

  handleBlur = () => {
    const { validateOnBlur, setFormikState } = this.context.formik;
    const { name } = this.props;

    // handleBlur(e); // Call Formik's handleBlur no matter what
    // setFormikState(prevState => ({
    //   values: setIn(prevState.values, name, this.state.value),
    // errors: setIn(prevState.errors, name, this.state.error),
    // touched: setIn(prevState.errors, name, true) // ?
    // }))
    if (validateOnBlur && this.props.validate) {
      this.runFieldValidations(this.state.value, true);
    } else {
      setFormikState((prevState: any) => ({
        ...prevState,
        values: setIn(prevState.values, name, this.state.value),
        touched: setIn(prevState.touched, name, true),
      }));
    }
  };

  runFieldValidations = (value: any, touched?: boolean) => {
    const { setFormikState } = this.context.formik;
    const { name, validate } = this.props;
    // Call validate fn
    const maybePromise = (validate as any)(value);
    // Check if validate it returns a Promise
    if (isPromise(maybePromise)) {
      (maybePromise as Promise<any>).then(
        () =>
          !touched
            ? this.setState({ value, error: undefined })
            : setFormikState((prevState: any) => ({
                ...prevState,
                values: setIn(prevState.values, name, value),
                errors: setIn(prevState.errors, name, undefined),
                touched: setIn(prevState.touched, name, true),
              })),
        error =>
          !touched
            ? this.setState({ value, error })
            : setFormikState((prevState: any) => ({
                ...prevState,
                values: setIn(prevState.values, name, value),
                errors: setIn(prevState.errors, name, error),
                touched: setIn(prevState.touched, name, true),
              }))
      );
    } else {
      // Otherwise set the error
      !touched
        ? this.setState({ value, error: maybePromise })
        : setFormikState((prevState: any) => ({
            ...prevState,
            values: setIn(prevState.values, name, value),
            errors: setIn(prevState.errors, name, maybePromise),
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
    } = this.props as FastFieldConfig;

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
      meta: { touched: getIn(formik.touched, name), error: this.state.error },
    };

    if (render) {
      return (render as any)(bag);
    }

    if (isFunction(children)) {
      return (children as (props: FastFieldProps<any>) => React.ReactNode)(bag);
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
