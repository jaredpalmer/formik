import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { object, string } from 'yup';
import { Debug } from './Debug';

const validationSchema = object().shape({
  email: string()
    .email('Invalid email')
    .required('Field is required'),
  username: string()
    .min(4, 'Must be at least 4 characters')
    .required('Field is required'),
});

const ValidateFieldWithSchema = () => (
  <div>
    <h1>Pick a username</h1>
    <Formik
      initialValues={{ username: '', email: '' }}
      validationSchema={validationSchema}
      onSubmit={values => {
        alert(JSON.stringify(values, null, 2));
      }}
      render={({
        errors,
        touched,
        setFieldValue,
        setFieldTouched,
        validateField,
        validateForm,
      }) => (
        <Form>
          <label htmlFor="username">Username</label>
          <div>
            <Field
              name="username"
              type="text"
              placeholder="Username"
            />
            <ErrorMessage name="username" />
          </div>
          <br />
          <div>
            <Field
              name="email"
              type="text"
              placeholder="Email"
            />
            <ErrorMessage name="email" />
          </div>

          <div>
            <div>username field actions</div>
            <button
              type="button"
              onClick={() => {
                setFieldTouched('username', true, true);
              }}
            >
              setFieldTouched
            </button>
            <button
              type="button"
              onClick={() => {
                setFieldValue('username', '', true);
              }}
            >
              setFieldValue
            </button>
            <button
              type="button"
              onClick={() => {
                validateField('username');
              }}
            >
              validateField
            </button>
            <br />
          </div>
          <br />
          <div>
            <div>Form actions</div>
            <button type="button" onClick={validateForm}>
              validate form
            </button>
            <button type="submit">Submit</button>
          </div>
          <Debug />
        </Form>
      )}
    />
  </div>
);

export default ValidateFieldWithSchema;
