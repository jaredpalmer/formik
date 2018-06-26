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
  return errors;
};

class SignIn extends React.Component {

  constructor(props) {
    super(props);
    this.state = { errors: {} };
  }

  render() {
    return (
      <div>
        <h1>Sign In</h1>
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
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

              <button type="submit">Sign In</button>
            </Form>
          )}
        />
      </div>
    );
  }

  handleSubmit = (values) => {
    if (EXISTING_EMAILS.indexOf(values.email) === -1) {
      this.setState({ errors: { email: 'That account does not exist' } });
    } else {
      this.setState({ errors: {} });
    }
  }
}

export default () => <SignIn />;