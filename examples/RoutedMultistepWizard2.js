/* eslint-disable jsx-a11y/accessible-emoji */
import React, { Fragment } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Link,
  Redirect,
} from 'react-router-dom';
import { Field, ErrorMessage, withFormik } from 'formik';
import { Debug } from './Debug';

const required = value => (value ? undefined : 'Required');

const Page1 = () => (
  <Fragment>
    <div>
      <label>First Name</label>
      <Field
        name="firstName"
        component="input"
        type="text"
        placeholder="First Name"
        validate={required}
      />
      <ErrorMessage name="firstName" component="div" className="field-error" />
    </div>
    <div>
      <label>Last Name</label>
      <Field
        name="lastName"
        component="input"
        type="text"
        placeholder="Last Name"
        validate={required}
      />
      <ErrorMessage name="lastName" component="div" className="field-error" />
    </div>
    <Link to="/step2">
      <button type="button">Next »</button>
    </Link>
  </Fragment>
);

const Page2 = () => (
  <Fragment>
    <div>
      <label>Email</label>
      <Field name="email" component="input" type="email" placeholder="Email" />
      <ErrorMessage name="email" component="div" className="field-error" />
    </div>
    <div>
      <label>Favorite Color</label>
      <Field name="favoriteColor" component="select">
        <option value="">Select a Color</option>
        <option value="#ff0000">❤️ Red</option>
        <option value="#00ff00">💚 Green</option>
        <option value="#0000ff">💙 Blue</option>
      </Field>
      <ErrorMessage
        name="favoriteColor"
        component="div"
        className="field-error"
      />
    </div>
    <Link to="/step1">
      <button type="button">Previous</button>
    </Link>
    <button type="submit">Submit</button>
  </Fragment>
);

const BaseForm = ({ values, handleSubmit }) => (
  <Router>
    <div className="App">
      <h1>Multistep / Form Wizard </h1>
      <form onSubmit={handleSubmit}>
        <Switch>
          <Route
            path="/step1"
            render={routeProps => <Page1 {...routeProps} />}
          />
          <Route
            path="/step2"
            render={routeProps => <Page2 {...routeProps} />}
          />
          <Redirect to="/step1" />
        </Switch>

        <Debug />
      </form>
    </div>
  </Router>
);

export const EnhancedForm = withFormik({
  /* setup initial values */
  mapPropsToValues: () => ({
    firstName: '',
    lastName: '',
    email: '',
    favoriteColor: '',
  }),

  validate: (values, props) => {
    console.log('props', props);
    const errors = {};

    if (!values.email) {
      errors.email = 'Required';
    }

    return errors;
  },

  handleSubmit: (values, { setSubmitting }) => {
    setTimeout(() => {
      alert(JSON.stringify(values, null, 2));
      setSubmitting(false);
    }, 1000);
  },

  displayName: 'BaseForm',
})(BaseForm);
