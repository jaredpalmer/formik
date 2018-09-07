import React from 'react';
import { Formik, Field, FastField, Form } from 'formik';

class Input extends React.Component {
  renders = 0;
  render() {
    const { field, form, ...rest } = this.props;
    return (
      <div>
        {this.renders++}
        <input {...field} {...rest} />
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
      onSubmit={values => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
        }, 500);
      }}
      render={() => (
        <Form>
          <label htmlFor="firstName">First Name</label>
          <FastField name="firstName" placeholder="Jane" component={Input} />

          <label htmlFor="lastName">Last Name</label>
          <FastField name="lastName" placeholder="Doe" component={Input} />

          <label htmlFor="email">Email</label>
          <FastField
            name="email"
            placeholder="jane@acme.com"
            type="email"
            component={Input}
          />

          <button type="submit">Submit</button>
        </Form>
      )}
    />
  </div>
);

export default Basic;
