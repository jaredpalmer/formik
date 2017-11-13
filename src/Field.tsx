import * as PropTypes from 'prop-types';
import * as React from 'react';

import { FormikProps } from './formik';
import { isEmptyChildren } from './utils';
import warning from 'warning';

export type GenericFieldHTMLAttributes =
  | React.InputHTMLAttributes<HTMLInputElement>
  | React.SelectHTMLAttributes<HTMLSelectElement>
  | React.TextareaHTMLAttributes<HTMLTextAreaElement>;

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
export interface FieldProps<V = any> {
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

export interface FieldConfig {
  /**
   * Field component to render. Can either be a string like 'select' or a component.
   */
  component?: string | React.ComponentType<FieldProps<any> | void>;

  /**
   * Render prop (works like React router's <Route render={props =>} />)
   */
  render?: ((props: FieldProps<any>) => React.ReactNode);

  /**
   * Children render function <Field name>{props => ...}</Field>)
   */
  children?: ((props: FieldProps<any>) => React.ReactNode);

  /**
   * Field name
   */
  name: string;

  /** HTML input type */
  type?: string;

  /** Field value */
  value?: any;
}

export type FieldAttributes = GenericFieldHTMLAttributes & FieldConfig;

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */

export class Field<Props extends FieldAttributes = any> extends React.Component<
  Props,
  {}
> {
  static contextTypes = {
    formik: PropTypes.object,
  };

  static defaultProps = {
    component: 'input',
  };

  static propTypes = {
    name: PropTypes.string.isRequired,
    component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    render: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
  };

  componentWillMount() {
    warning(
      !(typeof this.props.component !== 'string' && this.props.render),
      'You should not use <Field component> and <Field render> in the same <Field> component; <Field component> will be ignored'
    );

    warning(
      !(
        typeof this.props.component !== 'string' &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use a non-string <Field component> and <Field children> in the same <Field> component; <Field component> will be ignored.'
    );

    warning(
      !(
        this.props.render &&
        this.props.children &&
        !isEmptyChildren(this.props.children)
      ),
      'You should not use <Field render> and <Field children> in the same <Field> component; <Field children> will be ignored'
    );
  }

  render() {
    const { component, render, children, name, ...props } = this
      .props as FieldConfig;
    const { formik } = this.context;
    const field = {
      value:
        props.type === 'radio' || props.type === 'checkbox'
          ? props.value
          : formik.values[name],
      name,
      onChange: formik.handleChange,
      onBlur: formik.handleBlur,
    };
    const bag = { field, form: formik };

    if (render) {
      return (render as any)(bag);
    }

    if (typeof children === 'function') {
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
