import React from 'react';
import { Formik, Field, Form } from 'formik';

const EXISTING_EMAILS = [
  "foo@bar.com",
  "baz@buzz.io",
  "asdf@qwerty.com",
];

const validate = values => {
  let errors = {};
  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.password || values.password.length < 3) {
    errors.password = 'Password must be at least 3 characters long'
  }
  return errors;
};

class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      errors: {},
      values: { email: '', password: '' },
    };
  }

  render() {
    return (
      <div>
        <h1>Sign In</h1>
        <Formik
          initialValues={this.state.values}
          initialErrors={this.state.errors}
          enableReinitialize={true}
          validate={validate}
          onSubmit={(values, { setSubmitting }) => {
            setSubmitting(true);
            this.handleSubmit(values);
          }}
          render={({ errors, touched }) => (
            <Form>
              <label htmlFor="email">Email</label>
              <Field name="email" placeholder="john@acme.com" type="email" />

              {errors.email && touched.email &&
                <div className="field-error">{errors.email}</div>
              }

              <label htmlFor="password">Password</label>
              <Field name="password" type="password" />

              {errors.password && touched.password &&
                <div className="field-error">{errors.password}</div>
              }

              <button type="submit">Sign In</button>
            </Form>
          )}
        />
      </div>
    );
  }

  handleSubmit = (values) => {
    if (EXISTING_EMAILS.indexOf(values.email) === -1) {
      this.setState((prevState) => ({
        errors: { email: 'That account does not exist' },
        values: { ...prevState.values, email: values.email },
      }));
    } else {
      this.setState((prevState) => ({
        errors: {},
        values: { ...prevState.values, email: values.email },
      }));
    }
  }
}

export default () => <SignIn />;