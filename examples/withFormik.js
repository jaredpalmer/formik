import React from 'react';
import * as Yup from 'yup';
import { withFormik } from '../src/formik';
import { Debug } from './Debug';

const formikEnhancer = withFormik({
  mapPropsToValues: props => ({ email: props.user.email }),
  validationSchema: Yup.object().shape({
    email: Yup.string()
      .email('Invalid email address')
      .required('Email is required!'),
  }),
  handleSubmit: (values, { setSubmitting }) => {
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2));
      setSubmitting(false);
    }, 1000);
  },
  displayName: 'MyForm', // helps with React DevTools
});

const MyForm = props => {
  const {
    values,
    touched,
    errors,
    dirty,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    handleReset,
  } = props;
  return (
    <Form>
      <label htmlFor="email">Email</label>
      <Field name="email" placeholder="jane@acme.com" type="email" />
      <div>
        <ErrorMessage name="email" />
      </div>
      <button
        type="button"
        className="outline"
        onClick={handleReset}
        disabled={!dirty || isSubmitting}
      >
        Reset
      </button>
      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
      <Debug />
    </Form>
  );
};

export default formikEnhancer(MyForm);
