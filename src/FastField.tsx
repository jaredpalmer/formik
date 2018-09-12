import * as React from 'react';
import warning from 'warning';
import { connect } from './connect';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FormikContext,
} from './types';
import { getIn, isEmptyChildren, isFunction } from './utils';

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
  children?:
    | ((props: FastFieldProps<any>) => React.ReactNode)
    | React.ReactNode;

  /**
   * Validate a single field value independently
   */
  validate?: ((value: any) => string | Promise<void> | undefined);

  /** Override FastField's default shouldComponentUpdate */
  shouldUpdate?: (
    props: T & GenericFieldHTMLAttributes & { formik: FormikContext<any> }
  ) => boolean;

  /**
   * Field name
   */
  name: string;

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
  FastFieldAttributes<Props> & { formik: FormikContext<Values> },
  {}
> {
  constructor(
    props: FastFieldAttributes<Props> & { formik: FormikContext<Values> }
  ) {
    super(props);
    const { render, children, component } = props;
    warning(
      !(component && render),
      'You should not use <FastField component> and <FastField render> in the same <FastField> component; <FastField component> will be ignored'
    );

    warning(
      !(component && children && isFunction(children)),
      'You should not use <FastField component> and <FastField children> as a function in the same <FastField> component; <FastField component> will be ignored.'
    );

    warning(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <FastField render> and <FastField children> in the same <FastField> component; <FastField children> will be ignored'
    );
  }

  shouldComponentUpdate(
    props: FastFieldAttributes<Props> & { formik: FormikContext<Values> }
  ) {
    if (this.props.shouldUpdate) {
      return this.props.shouldUpdate(props);
    } else if (
      getIn(this.props.formik.values, this.props.name) !==
        getIn(props.formik.values, this.props.name) ||
      getIn(this.props.formik.errors, this.props.name) !==
        getIn(props.formik.errors, this.props.name) ||
      getIn(this.props.formik.touched, this.props.name) !==
        getIn(props.formik.touched, this.props.name) ||
      Object.keys(this.props).length !== Object.keys(props).length
    ) {
      return true;
    } else {
      return false;
    }
  }

  componentDidMount() {
    this.props.formik.registerField(this.props.name, {
      validate: this.props.validate,
    });
  }

  componentDidUpdate(
    prevProps: FastFieldAttributes<Props> & { formik: FormikContext<Values> }
  ) {
    if (this.props.name !== prevProps.name) {
      this.props.formik.unregisterField(prevProps.name);
      this.props.formik.registerField(this.props.name, {
        validate: this.props.validate,
      });
    }

    if (this.props.validate !== prevProps.validate) {
      this.props.formik.registerField(this.props.name, {
        validate: this.props.validate,
      });
    }
  }

  componentWillUnmount() {
    this.props.formik.unregisterField(this.props.name);
  }

  render() {
    const {
      validate,
      name,
      render,
      children,
      component = 'input',
      formik,
      ...props
    } = (this.props as FastFieldAttributes<Props> & {
      formik: FormikContext<Values>;
    }) as any;
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

export const FastField = connect<FastFieldAttributes<any>, any>(FastFieldInner);
