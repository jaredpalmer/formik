import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import { Debug } from './Debug';

// Async Validation
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const validate = (values) => {
  return sleep(300).then(() => {
    const errors = {};

    if (['admin', 'null', 'god'].includes(values.username)) {
      errors.username = 'Nice try';
    }

    if (!values.username) {
      errors.username = 'Required';
    }

    if (Object.keys(errors).length) {
      throw errors;
    }
  });
};

const Username = () => (
  <div>
    <h1>Pick a username</h1>
    <Formik
      initialValues={{
        username: '',
      }}
      validate={validate}
      onSubmit={values => {
        sleep(500).then(() => {
          alert(JSON.stringify(values, null, 2));
        });
      }}
      render={({ errors, touched }) => (
        <Form>
          <label htmlFor="username">Username</label>
          <Field name="username" type="text" />
          <ErrorMessage name="username" />
          <button type="submit">Submit</button>
          <Debug />
        </Form>
      )}
    />
  </div>
);

export default Username;
