# Formik

#### Forms in React, *without tears.*

Let's face it, forms are really really verbose in React. To make matters worse, most form helpers do wayyyyy too much magic and often have a significant performace cost. Formik is minimal a Higher Order Component that helps you with the 3 most annoying parts: 

 1. Transforming props to a flat React state, 
 2. Validation and error messages
 3. Transforming a flat React state back into a consumable payload for your API

Lastly, Formik helps you stay organized by colocating all of the above plus your submission handler in one place. This makes testing, refactoring, and reasoning about your forms a breeze.

## Installation

Add Formik and Yup to your project. Formik uses Yup, which is like Joi, for schema validation. 

```bash
npm i formik yup --save
```

## Usage 

Formik will inject the following into your stateless functional form component:

#### Injected Props (What you get for free)
- `values: object` - Your form's values
- `errors: object` - Validation errors, keys match values object shape exactly.
- `error: any` - A top-level error object, can be whatever you need.
- `handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void` - Submit handler. This should be passed to `<form onSubmit={onSubmit}>...</form>`
- `handleReset: () => void` - Reset handler. This should be passed to `<button onClick={handleReset}>...</button>`
- `isSubmitting: boolean` - Submitting state. Either true or false.
- `handleChange: (e: React.ChangeEvent<any>) => void` - General onChange event handler. This will update the form value according to an `<input/>`'s `name` attribute.
- `handleChangeValue: (name: string, value: any) => void` - Custom onChange handler. Use this when you have custom inputs (e.g. react-autocomplete). `name` should match the form value you wish to update.


### Simple Example

Imagine you want to build a form that lets you edit user data. However, your user API has nested objects like so. 

```js
{
   id: string,
   email: string,
   social: {
     facebook: string,
     twitter: string,
     ....
   }
}
```

When we are done we want our form to accept just a `user` prop and that's it.   

```js
// User.js
import React from 'react';
import Dialog from 'MySuperDialog';
import EditUserForm from './EditUserForm';

const EditUserDialog = ({ user }) =>
  <Dialog>
  	<EditUserForm user={user} />
  </Dialog>;
```

Enter Formik. 

```js
// EditUserForm.js
import React from 'react';
import Formik from 'formik';
import Yup from 'yup';

// Formik is a Higher Order Component that wraps a React Form. Mutable form values 
// are injected into a prop called `values`. Additionally, Formik injects
// an onChange handler that you can use on every input. You also get
// handleSubmit, errors, and isSubmitting for free. This makes building custom
// inputs easy.
const SimpleForm = ({ values, handleChange, handleSubmit, handleReset, errors, error, isSubmitting,  }) =>
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      name="email"
      value={values.email}
      onChange={handleChange}
      placeholder="john@apple.com"
    />
    {errors.email && <div>{errors.email}</div>}
    <input
      type="text"
      name="facebook"
      value={values.facebook}
      onChange={handleChange}
      placeholder="facebook username"
    />
    {errors.facebook && <div>{errors.facebook}</div>}
    <input
      type="text"
      name="twitter"
      value={values.twitter}
      onChange={handleChange}
      placeholder="twitter username"
    />
    {errors.twitter && <div>{errors.twitter}</div>}
    {error && error.message && <div style={{color: 'red'}}>Top Level Error: {error.message}</div>}
    <button onClick={handleReset}>Reset</button>
    <button type="submit" disabled={isSubmitting}>Submit</button>
  </form>;

// Now for the fun part. We need to tell Formik how we want to validate,
// transform props/state, and submit our form.
export default Formik({
  // Give our form a name for debugging in React DevTools
  displayName: 'SimpleForm',

  // Define our form's validation schema with Yup. It's like Joi, but for
  // the browser.
  validationSchema: Yup.object().shape({
    email: Yup.string().email().required(),
    twitter: Yup.string(),
    facebook: Yup.string(),
  }),

  // We now map React props to form values. These will be injected as `values` into
  // our form. (Note: in the real world, you would destructure props, but for clarity this is
  // not shown)
  mapPropsToValues: props => ({
    email: props.user.email,
    twitter: props.user.social,
    facebook: props.user.facebook,
  }),

  // Sometimes your API needs a different object shape than your form. Formik let's 
  // you map `values` back into a `payload` before they are
  // passed to handleSubmit.
  mapValuesToPayload: values => ({
    email: values.email,
    social: { 
      twitter: values.twitter, 
      facebook: values.facebook 
    },
  }),

  // Formik lets you colocate your submission handler with your form.
  // In addition to the payload (the result of mapValuesToPayload), you have
  // access to all props and some stateful helpers.
  handleSubmit: (payload, { props, setError, setSubmitting }) => {
    // do stuff with your payload
    // e.preventDefault(), setSubmitting, setError(undefined) are called before handle submit is. so you don
    CallMyApi(props.user.id, payload)
      .then(
        res => {
          setSubmitting(false)
          // do something to show success
          // MyToaster.showSuccess({ message: 'Success!' })
        },
        err => {
          setSubmitting(false)
          setError(err)
          // do something to show a rejected api submission
          // MyToaster.showError({ message: 'Shit!', error: err })
        }
      )
  },
})(SimpleForm);
```

#### Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)