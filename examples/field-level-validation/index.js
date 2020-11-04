import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form, ErrorMessage, useFormikContext } from 'formik';

const isRequired = (message) => (value) => (!!value ? undefined : message);

const Example = () => (
  <div>
    <h1>Pick a username</h1>
    <Formik
      initialValues={{ username: '', email: '' }}
      onSubmit={async (values) => {
        await new Promise((r) => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
    >
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
        <button type="submit">Submit</button>
        <hr />
        <Playground />
      </Form>
    </Formik>
  </div>
);

const Playground = () => {
  const {
    errors,
    touched,
    setFieldValue,
    setFieldTouched,
    validateField,
    validateForm,
  } = useFormikContext();
  return (
    <>
      <div>
        <div>
          <code>username</code> field actions
        </div>
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
      </div>
    </>
  );
};

ReactDOM.render(<Example />, document.getElementById('root'));
