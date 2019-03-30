---
id: FormikSubmitError
title: FormikSubmitError
custom_edit_url: https://github.com/jaredpalmer/formik/edit/master/docs/api/FormikSubmitError.md
---

This is a small throwable wrapper around `Error` that may be used to return submit validation errors from 
async onSubmit. The purpose being to handle and properly display validation errors that might happen on the backend side 
after data is sent from the client. Validation errors then should be distinguished from any other AJAX I/O problems or 
other server errors and wrapped in `FormikSubmitError` in the form of `{ field1: 'error', field2: 'error' }` then the
submission errors will be added to each field just like after client side validation errors are.

## Example

```jsx
import React from 'react';
import { Formik } from 'formik';

async function handleSubmit(values) {
    ajax.send(values) // send data asynchronously
        .catch(error => {
          if (error.validationErrors) {
            // wrap validation errors in FormikSubmitError (these should be of field1: 'error', field2: 'error'} format)
            throw new FormikSubmitError(error.validationErrorr);
          } else {
            // handle any other type of error
          }
        })
}

const BasicExample = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ name: 'jared' }}
      onSubmit={handleSubmit}
      render={props => (
        <form onSubmit={props.handleSubmit}>
          <input
            type="text"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.name}
            name="name"
          />
          {props.errors.name && <div id="feedback">{props.errors.name}</div>}
          <button type="submit">Submit</button>
        </form>
      )}
    />
  </div>
);
```

# Reference

## `new FormikSubmitError(errors: { [field: string]: string }): Error`

Submission errors wrapper for backend validation errors.
