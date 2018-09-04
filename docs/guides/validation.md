---
id: validation
title: Validation
---

Formik is designed to manage forms with complex validation with ease. Formik supports synchronous and asynchronous top-down form-level and bottom-up field-level validation. Furthermore, it comes with baked-in support for schema-based top-down form-level validation through Yup. This guide will describe the ins and outs of all of the above.

## Form-level Validation

Form-level validation is useful because you have complete access to all of your form's `values` and props whenever the function runs, so you can validate dependent fields at the same time.

There are 2 ways to do form-level validation with Formik:

* `<Formik validate>` and `withFormik({ validate: ... })`
* `<Formik validationSchema>` and `withFormik({ validationSchema: ... })`

## `validate`

`<Formik>` and `withFormik()` take has an prop/key called `validate` that accepts either a synchronous or asynchronous function.

```js
// Synchronous validation
const validate = (values, props) => {
  let errors = {};

  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  //...

  return errors;
};

// Async Validation
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const validate = (values, props) => {
  return sleep(2000).then(() => {
    let errors = {};
    if (['admin', 'null', 'god'].includes(values.username)) {
      errors.username = 'Nice try';
    }
    // ...
    if (Object.keys(errors).length) {
      throw errors;
    }
  });
};
```

## `validationSchema`

Formik has a special prop for Yup object schemas. When building Formik, we surveyed all the existing browser validation libraries and decided that Yup was our favorite. It's API uses a builder pattern and is similar to React PropTypes and Hapi.js's Joi library. We fell in love with Yup so much that we built a special prop into Formik just for these schemas.

```js
@todo
```
