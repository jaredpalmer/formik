import React from 'react';
import { Formik, Form, ErrorMessage, createTypedField, Field } from 'formik';
import * as Yup from 'yup';

let renderCount = 0;

type FormValues = {
  firstName: string,
  lastName: string,
  email: string,
  age: number,
  favorite: string,
  toggle: boolean,
  checked: number[],
  picked: string,
}

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  age: 21,
  favorite: '',
  toggle: false,
  checked: [],
  picked: '',
};

const TypedField = createTypedField<FormValues>();

const Basic = () => (
  <div>
    <h1>Sign Up</h1>
    <Formik
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Invalid email address').required('Required'),
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
        <TypedField
          name="firstName"
          placeholder="Jane"
        />
        <ErrorMessage name="firstName" component="p" />

        <TypedField name="lastName" placeholder="Doe" />
        <ErrorMessage name="lastName" component="p" />

        <TypedField
          id="email"
          name="email"
          placeholder="jane@acme.com"
          type="email"
        />
        <ErrorMessage name="email" component="p" />

        <TypedField
          id="age"
          name="age"
          placeholder="jane@acme.com"
          type="number"
          value=""
        />

        <label>
          <TypedField type="checkbox" name="toggle" />
          <span style={{ marginLeft: 3 }}>Toggle</span>
        </label>

        <div id="checkbox-group">Checkbox Group </div>
        <div role="group" aria-labelledby="checkbox-group">
          <label>
            <TypedField
              type="checkbox"
              name="checked"
              // @ts-expect-error why isn't this typed as `number` like the below are??
              value=""
            />
            <TypedField<'checked', {}>
              type="checkbox"
              name="checked"
              // @ts-expect-error
              value=""
            />
            <Field<FormValues, 'checked'>
              type="checkbox"
              name="checked"
              // @ts-expect-error
              value=""
              potato=""
            />
            One
          </label>
          <label>
            <TypedField type="checkbox" name="checked" value="Two" />
            Two
          </label>
          <label>
            <TypedField type="checkbox" name="checked" value="Three" />
            Three
          </label>
        </div>
        <div id="my-radio-group">Picked</div>
        <div role="group" aria-labelledby="my-radio-group">
          <label>
            <TypedField type="radio" name="picked" value="One" />
            One
          </label>
          <label>
            <TypedField type="radio" name="picked" value="Two" />
            Two
          </label>
        </div>
        <div>
          <label>
            Textarea
            <TypedField as="textarea" name="picked" value="Two" />
            <TypedField as="select" name="picked" />
          </label>
        </div>
        <button type="submit">Submit</button>
        <div id="renderCounter">{renderCount++}</div>
      </Form>
    </Formik>
  </div>
);

export default Basic;
