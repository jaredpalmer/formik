import * as PropTypes from 'prop-types';
import * as React from 'react';

import { FormikProps } from './formik';

export interface FieldProps {
  component: keyof React.ReactHTML | React.ComponentType<any>;
  name: string;
  type?: string;
  value?: any;
}

export interface InputProps {
  /** Name of the input */
  name: string;
  /** Classic React change handler, keyed by input name */
  onChange: (event: React.ChangeEvent<any>) => void;
  /** Mark input as touched */
  onBlur: (event: any) => void;
  /** Value of the input */
  value?: any;
}

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
export const Field: React.SFC<FieldProps> = (
  { component = 'input', name, ...props },
  context
) => {
  const field: InputProps = {
    value:
      props.type === 'radio' || props.type === 'checkbox'
        ? props.value
        : context.formik.values[name],
    name,
    onChange: context.formik.handleChange,
    onBlur: context.formik.handleBlur,
  };
  const bag: InputProps | FieldComponentProps =
    typeof component === 'string'
      ? field
      : {
          field,
          form: context.formik,
        };
  // Cast component to React.ComponentClass to prevent typescript error
  // https://github.com/Microsoft/TypeScript/issues/15019
  return React.createElement(component as React.ComponentClass<any>, {
    ...props,
    ...bag,
  });
};

Field.contextTypes = {
  formik: PropTypes.object,
};

/**
 * Note: These typings could be more restrictive, but then it would limit the
 * reusability of custom <Field/> components.
 *
 * @example
 * interface MyProps {
 *   ...
 * }
 *
 * export const MyInput: React.SFC<MyProps & FieldComponentProps> = ({
 *   field,
 *   form,
 *   ...props
 * }) =>
 *   <div>
 *     <input {...field} {...props}/>
 *     {form.touched[field.name] && form.errors[field.name]}
 *   </div>
 */
export interface FieldComponentProps<Values = any> {
  field: InputProps;
  form: FormikProps<Values>;
}
