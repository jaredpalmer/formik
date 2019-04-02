import React from 'react';
import { Formik, FastField, Form } from 'formik';
import { Debug } from './Debug';

class Input extends React.Component {
  renders = 0;
  render() {
    return (
      <div>
        <input {...this.props} />
        <p># of renders: {this.renders++}</p>
      </div>
    );
  }
}

const Basic = () => (
  <div>
    <h1>Sign Up</h1>
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
      }}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          setSubmitting(false);

          alert(JSON.stringify(values, null, 2));
        }, 500);
      }}
      render={({ isSubmitting }) => (
        <Form>
          <label htmlFor="firstName">First Name</label>
          <FastField
            name="firstName"
            placeholder="Jane"
            as={Input}
            disabled={isSubmitting}
          />

          <label htmlFor="lastName">Last Name</label>
          <FastField
            name="lastName"
            placeholder="Doe"
            as={Input}
            disabled={isSubmitting}
          />

          <label htmlFor="email">Email</label>
          <FastField
            name="email"
            placeholder="jane@acme.com"
            type="email"
            as={Input}
            disabled={isSubmitting}
          />

          <button type="submit">Submit</button>
          <Debug />
        </Form>
      )}
    />
  </div>
);

export default Basic;
