import * as React from 'react';

import { connect } from './connect';
import {
  FormikProps,
  GenericFieldHTMLAttributes,
  FormikContext,
  FormikHandlers,
} from './types';
import warning from 'tiny-warning';
import { getIn, isEmptyChildren, isFunction } from './utils';

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
export type FieldProps<Values = any, ValueType = any, Props = {}> = Props & {
  field: {
    /** Classic React change handler, keyed by input name */
    onChange: FormikHandlers['handleChange'];
    /** Mark input as touched */
    onBlur: FormikHandlers['handleBlur'];
    /** Value of the input */
    value: ValueType;
    /* name of the input */
    name: string;
  };
  form: FormikProps<Values>; // if ppl want to restrict this for a given form, let them.
};

export interface FieldConfig<Values = any, ValueType = any, Props = {}> {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?:
    | string
    | React.ComponentType<FieldProps<Values, ValueType, Props>>
    | React.ComponentType<void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: FieldProps<Values, ValueType, Props>) => React.ReactNode);

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?:
    | ((props: FieldProps<Values, ValueType, Props>) => React.ReactNode)
    | React.ReactNode;

  /**
   * Validate a single field value independently
   */
  validate?: ((value: ValueType) => string | Promise<void> | undefined);

  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: ValueType;

  /** Inner ref */
  innerRef?: (instance: any) => void;
}

export type FieldAttributes<
  Props,
  Values,
  ValueType = any
> = GenericFieldHTMLAttributes & FieldConfig<Values, ValueType, Props> & Props;

type FieldInnerProps<Props, Values, ValueType = any> = FieldAttributes<
  Props,
  Values,
  ValueType
> & { formik: FormikContext<Values> };

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
class FieldInner<
  Values = {},
  Props = {},
  ValueType = any
> extends React.Component<FieldInnerProps<Props, Values, ValueType>, {}> {
  constructor(props: FieldInnerProps<Props, Values, ValueType>) {
    super(props);
    const { render, children, component } = props;
    warning(
      !(component && render),
      'You should not use <Field component> and <Field render> in the same <Field> component; <Field component> will be ignored'
    );

    warning(
      !(component && children && isFunction(children)),
      'You should not use <Field component> and <Field children> as a function in the same <Field> component; <Field component> will be ignored.'
    );

    warning(
      !(render && children && !isEmptyChildren(children)),
      'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
    );
  }

  componentDidMount() {
    // Register the Field with the parent Formik. Parent will cycle through
    // registered Field's validate fns right prior to submit
    this.props.formik.registerField(this.props.name, this);
  }

  componentDidUpdate(prevProps: FieldInnerProps<Props, Values, ValueType>) {
    if (this.props.name !== prevProps.name) {
      this.props.formik.unregisterField(prevProps.name);
      this.props.formik.registerField(this.props.name, this);
    }

    if (this.props.validate !== prevProps.validate) {
      this.props.formik.registerField(this.props.name, this);
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
    } = this.props;
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
    const bag: FieldProps<Values, ValueType, Props> = {
      field,
      form: restOfFormik,
      ...this.props,
    };

    if (render) {
      return render(bag);
    }

    if (isFunction(children)) {
      return (children as (
        props: FieldProps<Values, ValueType, Props>
      ) => React.ReactNode)(bag);
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

export const Field = connect<FieldAttributes<any, any, {}>, any>(FieldInner);
