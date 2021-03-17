import React, { useEffect, useState } from 'react';
import { ErrorMessage, Field, Form, FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/router';

const selectSignInState = (formikState) => ({
  values: formikState.values,
  errors: formikState.errors,
  touched: formikState.touched,
});

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

  const signInState = {
    ...formik.useState(selectSignInState),
    ...formik.useComputedState(),
  };

  useEffect(() => {
    if (signInState.errors.username && signInState.touched.username) {
      setErrorLog(logs => [
        ...logs,
        {
          name: 'username',
          value: signInState.values.username,
          error: signInState.errors.username,
        },
      ]);
    }

    if (signInState.errors.password && signInState.touched.password) {
      setErrorLog(logs => [
        ...logs,
        {
          name: 'password',
          value: signInState.values.password,
          error: signInState.errors.password,
        },
      ]);
    }
  }, [
    signInState.values.username,
    signInState.errors.username,
    signInState.touched.username,
    signInState.values.password,
    signInState.errors.password,
    signInState.touched.password,
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

          <button type="submit" disabled={!signInState.isValid}>
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
