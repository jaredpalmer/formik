import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Debug } from './Debug';

const Schema = Yup.object().shape({
  email: Yup.string().required('This field is required'),
});

// Async Validation
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const validate = (values) =>
  sleep(300).then(() => {
    throw {
      zip: 'This field is required',
    };
  });

const isRequired = message => value => (!!value ? undefined : message);

const FieldLevelValidation = () => (
  <div>
    <h1>Pick a username</h1>
    <Formik
      validationSchema={Schema}
      validate={validate}
      initialValues={{
        username: '',
        email: '',
        zip: '',
      }}
      onSubmit={values => {
        sleep(500).then(() => {
          alert(JSON.stringify(values, null, 2));
        });
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
              validate={isRequired('This field is required')}
              type="text"
              placeholder="username"
            />
            <ErrorMessage name="username" />
          </div>
          <br />
          <div>
            <Field
              name="email"
              validate={isRequired('This field is required')}
              type="text"
              placeholder="email"
            />
            <ErrorMessage name="email" />
          </div>
          <br />
          <div>
            <Field
              name="zip"
              validate={isRequired('This field is required')}
              type="text"
              placeholder="zip"
            />
            <ErrorMessage name="zip" />
          </div>
          <br />
          <button type="submit">Submit</button>
          <Debug />
        </Form>
      )}
    />
  </div>
);

export default FieldLevelValidation;
