---
id: usefield
title: useField()
custom_edit_url: https://github.com/jaredpalmer/formik/edit/master/docs/api/usefield.md
---

`useField` is a custom React hook that will automagically help you hook up inputs to Formik. You can and should use it build your own custom input primitives.

## Example

```jsx
import React from 'react';
import { useField, Formik } from 'formik';

const MyTextField = ({ label, ...props }) => {
  const [field, meta] = useField(props.name);
  return (
    <>
      <label>
        {label}
        <input {...field} {...props} />
      </label>
      {meta.touch && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </>
  );
};

const Example = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ email: '', firstName: 'red', lastName: '' }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
      render={(props: FormikProps<Values>) => (
        <form onSubmit={props.handleSubmit}>
          <MyTextField name="firstName" type="text" label="First Name" />
          <MyTextField name="lastName" type="text" label="Last Name" />
          <MyTextField name="email" type="email" label="Email" />
          <button type="submit">Submit</button>
        </form>
      )}
    />
  </div>
);
```

---

# Reference

## `useField(name: string): [FieldProps, FieldMetaProps]`

A custom React Hook that returns a tuple (2 element array) containing `FieldProps` and `FieldMetaProps`.

### `FieldProps`

An object that contains:

* `onChange`
* `onBlur`
* `value`
* `name`

for a given field in Formik state. This is to avoid needing to manually wire up inputs.

### `FieldMeta`

An object that contains relevant computed metadata about a field. More specifically,

* `touch: boolean` - Whether the field has been visited (plucked out of `touched`)
* `error?: string` - The field's error message (plucked out of `errors`)
* `initialValue: any` - The field's initial value if the field is given a value in `initialValues` (plucked out of `initialValues`)
