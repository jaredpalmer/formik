import React from 'react';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';

const SignUp = () => (
  <div>
    <h1>Sign Up</h1>
    <Formik
      initialValues={{
        email: '',
        color: '',
        animal: '',
        website: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Invalid email address')
          .required('Required'),
        color: Yup.string().required('Required'),
        website: Yup.string()
          .url('Invalid URL')
          .required('Required'),
        animal: Yup.string().required('Required'),
      })}
      onSubmit={values => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
        }, 500);
      }}
      render={({ resetForm }) => (
        <Form>
          <TextInput name="email" label="Email" placeholder="jane@acme.com" />
          <Select name="color" label="Favorite Color">
            <option value="">Select a Color</option>
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </Select>

          <Fieldset
            name="website"
            type="url"
            label="Website"
            placeholder="https://example.com"
          />

          <Fieldset name="animal" component="select" label="Favorite Animal">
            <option value="">Select an animal</option>
            <option value="tiger">Tiger</option>
            <option value="bear">Bear</option>
            <option value="shark">Shark</option>
          </Fieldset>

          <button type="button" className="reset" onClick={resetForm}>
            Reset
          </button>

          <button type="submit">Submit</button>
        </Form>
      )}
    />
  </div>
);

const TextInput = ({ name, label, ...rest }) => (
  <Field
    name={name}
    render={({ field, form }) => {
      const error = form.touched[name] && form.errors[name];
      const classes = error ? 'fieldset fieldset--error' : 'fieldset';
      return (
        <div className={classes}>
          <label htmlFor={name}>{label}</label>
          <input {...field} {...rest} />
          {form.errors[name] &&
            form.touched[name] && (
              <div className="field-error">{form.errors[name]}</div>
            )}
        </div>
      );
    }}
  />
);

// This is identical to TextInput, except we will render a <select> instead.
// If this code seems smelly, it's because it is. Keep reading...
const Select = ({ name, label, ...rest }) => (
  <Field
    name={name}
    render={({ field, form }) => {
      const error = form.touched[name] && form.errors[name];
      const classes = error ? 'fieldset fieldset--error' : 'fieldset';
      return (
        <div className={classes}>
          <label htmlFor={name}>{label}</label>
          <select {...field} {...rest} />
          {form.errors[name] &&
            form.touched[name] && (
              <div className="field-error">{form.errors[name]}</div>
            )}
        </div>
      );
    }}
  />
);

// <TextInput> and <Select> are repetitive. At this point, we
// have some options. We could abstract away the label and error stuff into
// separate components and then reuse those. Or, better yet, you could wrap
// <Field>'s render and component props to make a new <Fieldset/> component
// that will add the label and display our errors while keeping almost the
// same API as <Field />
const Fieldset = ({ component = 'input', render, name, label, ...rest }) => (
  <Field
    name={name}
    render={({ field, form }) => {
      const error = form.touched[name] && form.errors[name];
      const classes = error ? 'fieldset fieldset--error' : 'fieldset';

      return (
        <div className={classes}>
          <label htmlFor={name}>{label}</label>
          {render
            ? render({ field, form, ...rest }) // render prop inception
            : component
              ? React.createElement(component, {
                  ...field,
                  ...rest,
                  invalid: (!!error).toString(),
                })
              : null}
          {error && <div className="field-error">{error}</div>}
        </div>
      );
    }}
  />
);

export default SignUp;
