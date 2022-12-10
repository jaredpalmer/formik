import React, { useEffect, useState } from 'react';
import { ErrorMessage, Field, Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';

const SignIn = () => {
  const router = useRouter();
  const [errorLog, setErrorLog] = useState([]);
  

  const formik = useFormik({
    validateOnMount: router.query.validateOnMount === 'true',
    validateOnBlur: router.query.validateOnBlur !== 'false',
    validateOnChange: router.query.validateOnChange !== 'false',
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
  
const {values,errors,touched,isValid} = formik

  useEffect(() => {
    if (errors.username && touched.username) {
      setErrorLog(logs => [
        ...logs,
        {
          name: 'username',
          value: values.username,
          error: errors.username,
        },
      ]);
    }

    if (errors.password && touched.password) {
      setErrorLog(logs => [
        ...logs,
        {
          name: 'password',
          value: values.password,
          error: errors.password,
        },
      ]);
    }
  }, [
    values.username,
    errors.username,
    touched.username,
    values.password,
    errors.password,
    touched.password,
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

          <button type="submit" disabled={!isValid}>
            Submit
          </button>

          <button
            type="reset"
            onClick={() => {
              setErrorLog([]);
            }}
          >
            Reset
          </button>

          <pre id="error-log">{JSON.stringify(errorLog, null, 2)}</pre>
        </Form>
      </FormikProvider>
    </div>
  );
};

export default SignIn;
