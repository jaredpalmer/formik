import React from 'react';
import { Formik, Field, Form } from 'formik';

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
            {errors.username &&
              touched.username && (
                <div className="field-error">{errors.username}</div>
              )}
          </div>
          <br />
          <div>
            <Field
              name="email"
              validate={isRequired('This field is required')}
              type="text"
              placeholder="Email"
            />
            {errors.email &&
              touched.email && (
                <div className="field-error">{errors.email}</div>
              )}
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
