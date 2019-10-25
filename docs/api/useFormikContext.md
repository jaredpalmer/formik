---
id: useFormikContext
title: useFormikContext()
custom_edit_url: https://github.com/jaredpalmer/formik/edit/master/docs/api/useFormikContext.md
---

`useFormikContext()` is a custom React hook that will return all Formik state and helpers via React Context.

## Example

Here's an example of a form that works similarly to Stripe's 2-factor verification form. As soon as you type a 6 digit number, the form will automatically submit (i.e. no enter keypress is needed).

```js
import React from 'react';
import { useFormikContext, Formik, Form, Field } from 'formik';

const AutoSubmitToken = () => {
  // Grab values and submitForm from context
  const { values, submitForm } = useFormikContext();
  React.useEffect(() => {
    // Submit the form imperatively as an effect as soon as form values.token are 6 digits long
    if (values.token.length === 6) {
      submitForm();
    }
  }, [values, submitForm]);
  return null;
};

const TwoFactorVerificationForm = () => (
  <div>
    <h1>2-step Verification</h1>
    <p>Please enter the 6 digit code sent to your device</p>
    <Formik
      initialValues={{ token: '' }}
      validate={values => {
        let errors;
        if (values.token.length < 5) {
          errors.token = 'Invalid code. Too short.'
        }
        return errors
      }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
    >
        <Form>
          <Field name="token" type="tel" />
          <AutoSubmitToken />
        </Form>
    </Formik>
  </div>
);
```

---

# Reference

## `useFormikContext(): FormikProps<Values>`

A custom React Hook that returns Formik states and helpers. This is the hooks version of using `connect()` and `<FormikConsumer>`. If called without a parent context, you will get a warning in your console.
