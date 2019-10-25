import * as React from 'react';

import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FormikContextType,
} from './types';
import invariant from 'tiny-warning';
import { getIn, isEmptyChildren, isFunction } from './utils';
import { FormikContext } from './FormikContext';

type $FixMe = any;

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

export interface FastFieldConfig<T> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  as?: string | React.ComponentType<FastFieldProps<any>> | React.ComponentType;
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FastFieldProps<any>>
    | React.ComponentType;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: (props: FastFieldProps<any>) => React.ReactNode;

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?:
    | ((props: FastFieldProps<any>) => React.ReactNode)
    | React.ReactNode;

  /**
   * Validate a single field value independently
   */
  validate?: (value: any) => string | Promise<void> | undefined;

  /** Override FastField's default shouldComponentUpdate */
  shouldUpdate?: (
    nextProps: T & GenericFieldHTMLAttributes,
    props: {}
  ) => boolean;

  /**
   * Field name
   */
  name: string;

  /** HTML class */
  className?: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: any;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FastFieldAttributes<T> = GenericFieldHTMLAttributes &
  FastFieldConfig<T> &
  T;

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
class FastFieldInner<Values = {}, Props = {}> extends React.Component<
  FastFieldAttributes<Props>,
  {}
> {
  static contextType = FormikContext;
  constructor(props: FastFieldAttributes<Props>) {
    super(props);
    const { render, children, component, as: is, name } = props;
    invariant(
      !render,
      `<FastField render> has been deprecated. Please use a child callback function instead: <FastField name={${name}}>{props => ...}</FastField> instead.`
    );
    invariant(
      !(component && render),
      'You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored'
    );

    invariant(
      !(is && children && isFunction(children)),
      'You should not use <FastField as> and <FastField children> as a function in the same <FastField> component; <FastField as> will be ignored.'
    );

    invariant(
      !(component && children && isFunction(children)),
      'You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.'
    );

    invariant(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored'
    );
  }

  shouldComponentUpdate(
    props: FastFieldAttributes<Props>,
    _state: {},
    context: FormikContextType<Values>
  ) {
    if (this.props.shouldUpdate) {
      return this.props.shouldUpdate(props, this.props);
    } else if (
      getIn(this.context.values, this.props.name) !==
        getIn(context.values, this.props.name) ||
      getIn(this.context.errors, this.props.name) !==
        getIn(context.errors, this.props.name) ||
      getIn(this.context.touched, this.props.name) !==
        getIn(context.touched, this.props.name) ||
      Object.keys(this.props).length !== Object.keys(props).length ||
      this.context.isSubmitting !== context.isSubmitting
    ) {
      return true;
    } else {
      return false;
    }
  }

  componentDidMount() {
    // Register the Field with the parent Formik. Parent will cycle through
    // registered Field's validate fns right prior to submit
    this.context.registerField(this.props.name, this);
  }

  componentDidUpdate(prevProps: FastFieldAttributes<Props>) {
    if (this.props.name !== prevProps.name) {
      this.context.unregisterField(prevProps.name);
      this.context.registerField(this.props.name, this);
    }

    if (this.props.validate !== prevProps.validate) {
      this.context.registerField(this.props.name, this);
    }
  }

  componentWillUnmount() {
    this.context.unregisterField(this.props.name);
  }

  render() {
    const {
      validate,
      name,
      render,
      as: is,
      children,
      component,
      shouldUpdate,
      ...props
    } = this.props as FastFieldAttributes<Props>;

    const formik = this.context;
    const {
      validate: _validate,
      validationSchema: _validationSchema,
      ...restOfFormik
    } = formik;
    const field = {
      value:
        props.type === 'radio' || props.type === 'checkbox'
          ? props.value // React uses checked={} for these inputs
          : getIn(formik.values, name),
      name,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    };
    const bag = { field, form: restOfFormik };

    if (render) {
      return (render as any)(bag);
    }

    if (isFunction(children)) {
      return (children as (props: FastFieldProps<any>) => React.ReactNode)(bag);
    }

    if (component) {
      // This behavior is backwards compat with earlier Formik 0.9 to 1.x
      if (typeof component === 'string') {
        const { innerRef, ...rest } = props;
        return React.createElement(
          component,
          { ref: innerRef, ...field, ...(rest as $FixMe) },
          children
        );
      }
      // We don't pass `meta` for backwards compat
      return React.createElement(
        component as React.ComponentClass<$FixMe>,
        { field, form: formik, ...props },
        children
      );
    }

    // default to input here so we can check for both `as` and `children` above
    const asElement = is || 'input';

    if (typeof asElement === 'string') {
      const { innerRef, ...rest } = props;
      return React.createElement(
        asElement,
        { ref: innerRef, ...field, ...(rest as $FixMe) },
        children
      );
    }

    return React.createElement(
      asElement as React.ComponentClass,
      { ...field, ...props },
      children
    );
  }
}

export const FastField = FastFieldInner;
