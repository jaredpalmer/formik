import * as React from 'react';
import * as Yup from 'yup';

import { InjectedFormikProps, withFormik } from '../src/formik';

export interface Props {
  user: {
    email: string;
  };
}

interface Values {
  email: string;
}

const formikEnhancer = withFormik<Props, Values>({
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

const MyForm: React.SFC<InjectedFormikProps<Props, Values>> = props => {
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
    <form onSubmit={handleSubmit}>
      <label htmlFor="email" style={{ display: 'block' }}>
        Email
      </label>
      <input
        id="email"
        placeholder="Enter your email"
        type="text"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        className={
          errors.email && touched.email ? 'text-input error' : 'text-input'
        }
      />
      {errors.email &&
        touched.email &&
        <div className="input-feedback">
          {errors.email}
        </div>}

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
    </form>
  );
};

export default formikEnhancer(MyForm);
