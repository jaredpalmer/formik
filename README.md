# Formik

#### Forms in React, *without tears.*

Let's face it, forms are really really verbose in React. To make matters worse, most form helpers do wayyyyy too much magic and often have a significant performace cost. Formik takes a step back and helps you with the 3 most annoying parts: 

 1. Transforming props to React state, 
 2. Validation and error messages
 3. Transforming React state into a consumable payload for your API

Lastly, Formik helps you stay organized by colocating all of the above plus your submission handler in one place. This makes testing, refactoring, and reasoning about your forms a breeze.

## Installation

Add Formik to your project.

```bash
npm i formik --save
```

## Walkthrough

Imagine you want to build a form that let's you edit user data. However, your User API has nested objects like so. 

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
With Formik, you'd write:

```js
import React from 'react';
import Formik from 'formik';
import Yup from 'yup';

const EditUserForm = ({
  values: { email, facebook, twitter },
  onChange,
  onSubmit,
  errors,
  isSubmitting,
}) =>
  <form onSubmit={onSubmit}>
    <label htmlFor="email">Public Email</label>
    <input type="email" name="email" onChange={onChange} value={email} />
    {errors.email && <div>{errors.email}</div>}

    <label htmlFor="facebook">Facebook Page URL</label>
    <input type="text" name="facebook" onChange={onChange} value={facebook} />
    {errors.facebook && <div>{errors.facebook}</div>}

    <label htmlFor="twitter">Twitter URL</label>
    <input type="url" name="twitter" onChange={onChange} value={facebook} />
    {errors.twitter && <div>{errors.twitter}</div>}

    <button type="submit" disabled={isSubmitting}>Submit</button>
  </form>;

export default Formik({
  // Helps with debugging in React DevTools
  displayName: 'SimpleForm',
  
  // Form schemas with Yup (which is like Joi, but for the browser)
  validationSchema: Yup.object().shape({
    email: Yup.string().email().required(),
    facebook: Yup.string().url(),
    twitter: Yup.string().url(),
  }),
  
  // Maps props to form values
  mapPropsToValues: ({ email, social }) => ({ email, ...social }),
  
  // Map form values to submission payload
  mapValuesToPayload: ({ email, facebook, twitter }) => ({
    email,
    social: { facebook, twitter },
  }),
  
  // Submission handler
  handleSubmit: (payload, { props, setSubmitting }) => {
    // submit the payload to your api.
  },
})(EditUserForm);

``` 

Now we can use the form anywhere and move on with our lives.

```js
// User.js
import React from 'react';
import EditUserForm from './EditUserForm'

const User = ({ user }) =>
  <div>
  	<EditUserForm user={user} />
  </div>;
```

#### Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)