---
id: version-1.2.0-tutorial
title: Tutorial
original_id: tutorial
---

Imagine you want to build a form that lets you edit user data. However, your
user API has nested objects like so.

```js
{
   id: string,
   email: string,
   social: {
     facebook: string,
     twitter: string,
     // ...
   }
}
```

When we are done we want our dialog to accept just a `user`, `updateUser`, and
`onClose` props.

```jsx
// User.js
import React from 'react';
import Dialog from 'MySuperDialog';
import { Formik } from 'formik';

const EditUserDialog = ({ user, updateUser, onClose }) => {
  return (
    <Dialog onClose={onClose}>
      <h1>Edit User</h1>
      <Formik
        initialValues={user /** { email, social } */}
        onSubmit={(values, actions) => {
          CallMyApi(user.id, values).then(
            updatedUser => {
              actions.setSubmitting(false);
              updateUser(updatedUser), onClose();
            },
            error => {
              actions.setSubmitting(false);
              actions.setErrors(transformMyAPIErrorToAnObject(error));
            }
          );
        }}
        render={({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
            {errors.email && touched.email && <div>{errors.email}</div>}
            <input
              type="text"
              name="social.facebook"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.social.facebook}
            />
            {errors.social &&
              errors.social.facebook &&
              touched.facebook && <div>{errors.social.facebook}</div>}
            <input
              type="text"
              name="social.twitter"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.social.twitter}
            />
            {errors.social &&
              errors.social.twitter &&
              touched.twitter && <div>{errors.social.twitter}</div>}
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )}
      />
    </Dialog>
  );
};
```

To make writing forms less verbose. Formik comes with a few helpers to save you
key strokes.

* `<Field>`
* `<Form />`

This is the **exact** same form as before, but written with `<Form />` and
`<Field />`:

```jsx
// EditUserDialog.js
import React from 'react';
import Dialog from 'MySuperDialog';
import { Formik, Field, Form } from 'formik';

const EditUserDialog = ({ user, updateUser, onClose }) => {
  return (
    <Dialog onClose={onClose}>
      <h1>Edit User</h1>
      <Formik
        initialValues={user /** { email, social } */}
        onSubmit={(values, actions) => {
          CallMyApi(user.id, values).then(
            updatedUser => {
              actions.setSubmitting(false);
              updateUser(updatedUser), onClose();
            },
            error => {
              actions.setSubmitting(false);
              actions.setErrors(transformMyAPIErrorToAnObject(error));
            }
          );
        }}
        render={({ errors, touched, isSubmitting }) => (
          <Form>
            <Field type="email" name="email" />
            {errors.email && touched.email && <div>{errors.email}</div>}
            <Field type="text" name="social.facebook" />
            {errors.social.facebook &&
              touched.social.facebook && <div>{errors.social.facebook}</div>}
            <Field type="text" name="social.twitter" />
            {errors.social.twitter &&
              touched.social.twitter && <div>{errors.social.twitter}</div>}
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      />
    </Dialog>
  );
};
```
