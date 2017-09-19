import * as React from 'react';

import { Field, Form, Formik } from '../src/formik';

// ALL OF THESE ARE THE SAME...

// 1: component={}
export const BasicComponentPropExample = () =>
  <div>
    <h1>My Cool Form</h1>
    <Formik
      onSubmit={values => console.log(values)}
      initialValues={{ firstName: '', lastName: '', email: '' }}
      component={MyFormHelpers}
    />
  </div>;

export const MyFormWithHelpers = props =>
  <Form className="whatever">
    <Field name="firstName" placeholder="First Name" />
    <Field name="lastName" placeholder="Last Name" />
    <Field name="email" type="email" placeholder="Email Address" />
    <button type="submit">Submit</button>
  </Form>;

// This is the same as MyFormWithHelper but just by passing props instead of
// using context.
export const MyFormWithoutHelpers = props =>
  <form className="whatever" onSubmit={props.handleSubmit}>
    <input
      name="firstName"
      placeholder="First Name"
      onChange={props.handleChange}
      onBlur={props.handleBlur}
      value={props.values.firstName}
    />
    <input
      name="lastName"
      placeholder="Last Name"
      onChange={props.handleChange}
      onBlur={props.handleBlur}
      value={props.values.lastName}
    />
    <input
      name="email"
      type="email"
      placeholder="Email Address"
      onChange={props.handleChange}
      onBlur={props.handleBlur}
      value={props.values.email}
    />
    <button type="submit">Submit</button>
  </form>;

// 2: render={(props) => ...}
export const BasicRenderPropExample = () =>
  <div>
    <h1>My Cool Form</h1>
    <Formik
      onSubmit={values => console.log(values)}
      initialValues={{ firstName: '', lastName: '', email: '' }}
      render={props =>
        <Form className="whatever">
          <Field name="firstName" placeholder="First Name" />
          <Field name="lastName" placeholder="Last Name" />
          <Field name="email" type="email" placeholder="Email Address" />
          <button type="submit">Submit</button>
        </Form>}
    />
  </div>;

// 3: React children
export const BasicChildrenPropExample = () =>
  <div>
    <h1>My Cool Form</h1>
    <Formik
      onSubmit={values => console.log(values)}
      initialValues={{ firstName: '', lastName: '', email: '' }}
    >
      {props =>
        <Form className="whatever">
          <Field name="firstName" placeholder="First Name" />
          <Field name="lastName" placeholder="Last Name" />
          <Field name="email" type="email" placeholder="Email Address" />
          <button type="submit">Submit</button>
        </Form>}
    </Formik>
  </div>;