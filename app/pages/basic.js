import React from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const Basic = () => {
  const renderCount = React.useRef(0);
  return (
    <div>
      <h1>Sign Up</h1>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          email: '',
          favorite: '',
          checked: [],
          picked: '',
        }}
        validationSchema={Yup.object().shape({
          email: Yup.string()
            .email('Invalid email address')
            .required('Required'),
          firstName: Yup.string().required('Required'),
          lastName: Yup.string()
            .min(2, 'Must be longer than 2 characters')
            .max(20, 'Nice try, nobody has a last name that long')
            .required('Required'),
        })}
        onSubmit={async values => {
          await new Promise(r => setTimeout(r, 500));
          alert(JSON.stringify(values, null, 2));
        }}
      >
        <Form>
          <Field name="firstName" placeholder="Jane" />
          <ErrorMessage name="firstName" component="p" />

          <Field name="lastName" placeholder="Doe" />
          <ErrorMessage name="lastName" component="p" />

          <Field
            id="email"
            name="email"
            placeholder="jane@acme.com"
            type="email"
          />
          <ErrorMessage name="email" component="p" />

          <label>
            <Field type="checkbox" name="toggle" />
            <span style={{ marginLeft: 3 }}>Toggle</span>
          </label>

          <div id="checkbox-group">Checkbox Group </div>
          <div role="group" aria-labelledby="checkbox-group">
            <label>
              <Field type="checkbox" name="checked" value="One" />
              One
            </label>
            <label>
              <Field type="checkbox" name="checked" value="Two" />
              Two
            </label>
            <label>
              <Field type="checkbox" name="checked" value="Three" />
              Three
            </label>
          </div>
          <div id="my-radio-group">Picked</div>
          <div role="group" aria-labelledby="my-radio-group">
            <label>
              <Field type="radio" name="picked" value="One" />
              One
            </label>
            <label>
              <Field type="radio" name="picked" value="Two" />
              Two
            </label>
          </div>
          <button type="submit">Submit</button>
          <div id="renderCounter">{renderCount.current++}</div>
        </Form>
      </Formik>
    </div>
  );
};

export default Basic;
