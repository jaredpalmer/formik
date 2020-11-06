import React from 'react';
import { ErrorMessage, Field, Form, Formik } from 'formik';
import * as Yup from 'yup';

const SignIn = () => (
  <div>
    <h1>Sign In</h1>

    <Formik
      validateOnMount={true}
      initialValues={{ username: '', password: '' }}
      validationSchema={Yup.object().shape({
        username: Yup.string().required('Required'),
        password: Yup.string().required('Required'),
      })}
      onSubmit={async values => {
        await new Promise(r => setTimeout(r, 500));
        alert(JSON.stringify(values, null, 2));
      }}
    >
      {formik => (
        <Form>
          <div>
            <Field name="username" placeholder="Username" />
            <ErrorMessage name="username" component="p" />
          </div>

          <div>
            <Field name="password" placeholder="Password" type="password" />
            <ErrorMessage name="password" component="p" />
          </div>

          <button type="submit" disabled={!formik.isValid}>
            Submit
          </button>
        </Form>
      )}
    </Formik>
  </div>
);

export default SignIn;
