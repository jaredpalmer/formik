---
id: useFastField
title: useFastField()
custom_edit_url: https://github.com/jaredpalmer/formik/edit/master/docs/api/useFastField.md
---

`useFastField` is a custom React hook that will automagically help you hook up inputs in a similar way to `useField`.
The useFastField behaviour imitates `useField` when Formik is configured to validate onBlur. The Formik values model is not updated after an onChange event only the input field is updated. After an onBlur event, the Formik values and error model are all update resulting in some minor behaviour variations. There are 2 ways to use it.

## Example

```tsx
import React from 'react';
import { useFastField, Formik } from 'formik';

const MyTextField = ({ label, ...props }) => {
  const [field, meta] = useFastField(props.name);
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

## `useFastField<Value = any>(name: string): [FieldInputProps<Value>, FieldMetaProps<Value>]`

A custom React Hook that returns a tuple (2 element array) containing `FieldProps` and `FieldMetaProps`.

### `FieldInputProps`

An object that contains:

- `name: string` - The name of the field
- `onBlur: () => void;` - A blur event handler
- `onChange: (e: React.ChangeEvent<any>) => void` - A change event handler
- `value: any` - The field's value (plucked out of `values`)

for a given field in Formik state. This is to avoid needing to manually wire up inputs.

### `FieldMetaProps`

An object that contains relevant computed metadata about a field. More specifically,

- `error?: string` - The field's error message (plucked out of `errors`)
- `initialError?: string` - The field's initial error if the field is present in `initialErrors` (plucked out of `initialErrors`)
- `initialTouched: boolean` - The field's initial value if the field is present in `initialTouched` (plucked out of `initialTouched`)
- `initialValue?: any` - The field's initial value if the field is given a value in `initialValues` (plucked out of `initialValues`)
- `touched: boolean` - Whether the field has been visited (plucked out of `touched`)
- `value: any` - The field's value (plucked out of `values`)
