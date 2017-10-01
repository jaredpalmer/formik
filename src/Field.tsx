import * as PropTypes from 'prop-types';
import * as React from 'react';

import { FormikProps } from './formik';

/**
 * Custom Field component for quickly hooking into Formik
 * context and wiring up forms.
 */
export const Field: React.SFC<any> = (
  { component = 'input', name, ...props },
  context
) => {
  const fieldValue =
    props.type === 'radio' || props.type === 'checkbox'
      ? props.value
      : context.formik.values[name];
  const fieldInitialValue = context.formik.initialValues[name];
  const fieldIsPristine = fieldValue === fieldInitialValue;
  const field = {
    input: {
      value: fieldValue,
      name,
      onChange: context.formik.handleChange,
      onBlur: context.formik.handleBlur,
    },
    meta: {
      dirty: !fieldIsPristine,
      error: context.formik.errors[name],
      initialValue: fieldInitialValue,
      pristine: fieldIsPristine,
      touched: context.formik.touched[name],
    },
  };
  const bag =
    typeof component === 'string'
      ? field.input
      : {
          field,
          form: context.formik,
        };
  return React.createElement(component, {
    ...props,
    ...bag,
  });
};

Field.contextTypes = {
  formik: PropTypes.object,
};

Field.propTypes = {
  name: PropTypes.string.isRequired,
  component: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
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
export interface FieldProps {
  field: {
    /** Classic React change handler, keyed by input name */
    onChange: (e: React.ChangeEvent<any>) => void;
    /** Mark input as touched */
    onBlur: (e: any) => void;
    /** Value of the input */
    value: any;
  };
  form: FormikProps<any>;
}
