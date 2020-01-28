import React from 'react';
import ReactDOM from 'react-dom';
import { Formik, Field, Form } from 'formik';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const Basic = () => (
  <div>
    <h1>Sign Up</h1>
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
      }}
      onSubmit={async values => {
        await sleep(500);
        alert(JSON.stringify(values, null, 2));
      }}
    >
      <Form>
        <label htmlFor="firstName">First Name</label>
        <Field name="firstName" placeholder="Jane" />

        <label htmlFor="lastName">Last Name</label>
        <Field name="lastName" placeholder="Doe" />

        <label htmlFor="email">Email</label>
        <Field name="email" placeholder="jane@acme.com" type="email" />
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  </div>
);

ReactDOM.render(<Basic />, document.getElementById('root'));
