import React, { useEffect, useState } from 'react';
import { ErrorMessage, Field, Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';

const SignIn = () => {
  const [errorLog, setErrorLog] = useState([]);

  const formik = useFormik({
    validateOnMount: true,
    initialValues: { username: '', password: '' },
    validationSchema: Yup.object().shape({
      username: Yup.string().required('Required'),
      password: Yup.string().required('Required'),
    }),
    onSubmit: async values => {
      await new Promise(r => setTimeout(r, 500));
      alert(JSON.stringify(values, null, 2));
    },
  });

  useEffect(() => {
    if (formik.errors.username && formik.touched.username) {
      setErrorLog(logs => [
        ...logs,
        {
          name: 'username',
          value: formik.values.username,
          error: formik.errors.username,
        },
      ]);
    }

    if (formik.errors.password && formik.touched.password) {
      setErrorLog(logs => [
        ...logs,
        {
          name: 'password',
          value: formik.values.password,
          error: formik.errors.password,
        },
      ]);
    }
  }, [
    formik.values.username,
    formik.errors.username,
    formik.touched.username,
    formik.values.password,
    formik.errors.password,
    formik.touched.password,
  ]);

  return (
    <div>
      <h1>Sign In</h1>

      <FormikProvider value={formik}>
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

          <pre id="error-log">{JSON.stringify(errorLog, null, 2)}</pre>
        </Form>
      </FormikProvider>
    </div>
  );
};

export default SignIn;
