import React from 'react';
import { Formik, FastField as Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';

let renderCount = 0;

const Basic = () => (
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
        lastName2: '',
        lastName3: '',
        lastName4: '',
        lastName5: '',
        lastName6: '',
        lastName7: '',
        lastName8: '',
        lastName9: '',
        lastName10: '',
        lastName11: '',
        lastName12: '',
        lastName13: '',
        lastName14: '',
        lastName15: '',
        lastName16: '',
        lastName17: '',
        lastName18: '',
        lastName19: '',
        lastName20: '',
      }}
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
        <Field name="firstName" placeholder="Jane" />
        <ErrorMessage name="firstName" component="p" />

        <Field name="lastName" placeholder="Doe" />
        <Field name="lastName2" placeholder="Doe" />
        <Field name="lastName3" placeholder="Doe" />
        <Field name="lastName4" placeholder="Doe" />
        <Field name="lastName5" placeholder="Doe" />
        <Field name="lastName6" placeholder="Doe" />
        <Field name="lastName7" placeholder="Doe" />
        <Field name="lastName8" placeholder="Doe" />
        <Field name="lastName9" placeholder="Doe" />
        <Field name="lastName10" placeholder="Doe" />
        <Field name="lastName11" placeholder="Doe" />
        <Field name="lastName12" placeholder="Doe" />
        <Field name="lastName13" placeholder="Doe" />
        <Field name="lastName14" placeholder="Doe" />
        <Field name="lastName15" placeholder="Doe" />
        <Field name="lastName16" placeholder="Doe" />
        <Field name="lastName17" placeholder="Doe" />
        <Field name="lastName18" placeholder="Doe" />
        <Field name="lastName19" placeholder="Doe" />
        <Field name="lastName20" placeholder="Doe" />
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
        <div id="renderCounter">{renderCount++}</div>
      </Form>
    </Formik>
  </div>
);

export default Basic;
