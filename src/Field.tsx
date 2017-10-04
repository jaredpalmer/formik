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
      name,
      value: fieldValue,
      onBlur: context.formik.handleBlur,
      onChange: context.formik.handleChange,
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
 *   ...props
 * }) =>
 *   <div>
 *     <input {...field.input} {...props}/>
 *     {field.meta.touched && field.meta.error}
 *   </div>
 */
export interface FieldProps {
  field: {
    input: {
      /** Name of the input */
      name: string;
      /** Value of the input */
      value: any;
      /** Mark input as touched */
      onBlur: (e: any) => void;
      /** Classic React change handler, keyed by input name */
      onChange: (e: React.ChangeEvent<any>) => void;
    };
    meta: {
      /** True if field value is not the same as field initial value */
      dirty: boolean;
      /** Validation error of the field */
      error?: string;
      /** Initial value of the field */
      initialValue: any;
      /** True if field value is the same as field initial value */
      pristine: boolean;
      /** True if the field has been touched */
      touched: boolean;
    };
  };
  form: FormikProps<any>;
}
