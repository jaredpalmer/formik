import React from 'react';
import { Formik, Field, Form } from 'formik';

class Controlled extends React.Component {
  state = {
    firstName: '',
    lastName: '',
    email: '',
  };
  render() {
    return (
      <div>
        <h1>Sign Up</h1>
        <Formik
          // Formik can be used as a controlled component
          // You give it values, and it will coordinate
          // validation and errors.
          values={this.state}
          // onChange will give you the ability to update
          // your controlled state whenever Formik state
          // updates. It is up to you to make sure that
          // this update works as Formik expects it to.
          onChange={({ values /* errors, isSubmitting, etc. */ }) =>
            this.setState(values)
          }
          onSubmit={() => {
            setTimeout(() => {
              alert(JSON.stringify(this.state, null, 2));
            }, 500);
          }}
          render={({ values }) => (
            <Form>
              <label htmlFor="firstName">First Name</label>
              <Field name="firstName" placeholder="Jane" />

              <label htmlFor="lastName">Last Name</label>
              <Field name="lastName" placeholder="Doe" />

              <label htmlFor="email">Email</label>
              <Field name="email" placeholder="jane@acme.com" type="email" />

              <button type="submit">Submit</button>
              <pre>{JSON.stringify(this.state, null, 2)}</pre>
            </Form>
          )}
        />
      </div>
    );
  }
}

export default Controlled;
