import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';

const isRequired = message => value => (!!value ? undefined : message);

const FieldLevelValidation = () => (
  <div>
    <h1>Pick a username</h1>
    <Formik
      initialValues={{ username: '', email: '' }}
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
              validate={isRequired('This field is required')}
              type="text"
              placeholder="Username"
            />
            <ErrorMessage name="username" />
          </div>
          <br />
          <div>
            <Field
              name="email"
              validate={isRequired('This field is required')}
              type="text"
              placeholder="Email"
            />
            <ErrorMessage name="email" />
          </div>
          <div>
            <pre>
              Errors:<br />
              {JSON.stringify(errors, null, 2)}
            </pre>
          </div>
          <div>
            <pre>
              Touched:<br />
              {JSON.stringify(touched, null, 2)}
            </pre>
          </div>

          <div>
            <div>username actions</div>
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
        </Form>
      )}
    />
  </div>
);

export default FieldLevelValidation;
