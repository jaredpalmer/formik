---
id: version-2.0.4-useField
title: useField()
custom_edit_url: https://github.com/jaredpalmer/formik/edit/master/docs/api/usefield.md
original_id: useField
---

`useField` is a custom React hook that will automagically help you hook up inputs to Formik. You can and should use it to build your own custom input primitives. There are 2 ways to use it.

## Example

```tsx
import React from 'react';
import { useField, Formik } from 'formik';

const MyTextField = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label>
        {label}
        <input {...field} {...props} />
      </label>
      {meta.touched && meta.error ? (
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

## `useField<Value = any>(name: string | FieldAttributes<Val>): [FieldInputProps<Value>, FieldMetaProps<Value>]`

A custom React Hook that returns a tuple (2 element array) containing `FieldProps` and `FieldMetaProps`. It accepts either a string of a field name or an object as an argument. The object must at least contain a `name` key. This object should identical to the props that you would pass to `<Field>` and the returned helpers will mimic the behavior of `<Field>` exactly. This is useful, and generally preferred, since it allows you to take advantage of formik's checkbox, radio, and multiple select behavior when the object contains the relevant key/values (e.g. `type: 'checkbox'`, `multiple: true`, etc.).

```jsx
import React from 'react';
import { useField } from 'formik';

function MyTextField(props) {
  // this will return field props for an <input />
  const [field, meta] = useField(props.name);
  return (
    <>
      <input {...field} {...props} />
      {meta.error && meta.touched && <div>{meta.error}</div>}
    </>
  );
}

function MyInput(props) {
  // this will return field exactly like <Field>{({ field }) => ... }</Field>
  const [field, meta] = useField(props);
  return (
    <>
      <input {...field} {...props} />
      {meta.error && meta.touched && <div>{meta.error}</div>}
    </>
  );
}
```

### `FieldInputProps`

An object that contains:

- `name: string` - The name of the field
- `checked?: boolean` - Whether or not the input is checked, this is _only_ defined if `useField` is passed an object with a `name`, `type: "checkbox"` or `type: radio`.
- `onBlur: () => void;` - A blur event handler
- `onChange: (e: React.ChangeEvent<any>) => void` - A change event handler
- `value: any` - The field's value (plucked out of `values`) or, if it is a checkbox or radio input, then potentially the `value` passed into `useField`.
- `multiple?: boolean` - Whether or not the multiple values can be selected. This is only ever defined when `useField` is passed an object with `multiple: true`

### `FieldMetaProps`

An object that contains relevant computed metadata about a field. More specifically,

- `error?: string` - The field's error message (plucked out of `errors`)
- `initialError?: string` - The field's initial error if the field is present in `initialErrors` (plucked out of `initialErrors`)
- `initialTouched: boolean` - The field's initial value if the field is present in `initialTouched` (plucked out of `initialTouched`)
- `initialValue?: any` - The field's initial value if the field is given a value in `initialValues` (plucked out of `initialValues`)
- `touched: boolean` - Whether the field has been visited (plucked out of `touched`)
- `value: any` - The field's value (plucked out of `values`)
