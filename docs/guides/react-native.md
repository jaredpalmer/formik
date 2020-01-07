---
id: react-native
title: React Native
custom_edit_url: https://github.com/jaredpalmer/formik/edit/master/docs/guides/react-native.md
---

**Formik is 100% compatible with React Native and React Native Web.** However, because of differences between ReactDOM's and React Native's handling of forms and text input, there are some differences to be aware of. This section will walk you through them and what we consider to be best practices.

### Basic usage

```jsx
// Formik x React Native example
import React from 'react';
import { Button, TextInput, View } from 'react-native';
import { Formik } from 'formik';

export const MyReactNativeForm = props => (
  <Formik
    initialValues={{ email: '' }}
    onSubmit={values => console.log(values)}
  >
    {({ handleChange, handleBlur, handleSubmit, values }) => (
      <View>
        <TextInput
          onChangeText={handleChange}
          onBlur={handleBlur}
          value={values.email}
        />
        <Button onPress={handleSubmit} title="Submit" />
      </View>
    )}
  </Formik>
);
```

As you can see above, the notable differences between using Formik with React
DOM and React Native are:

1.  Formik's `handleSubmit` is passed to a `<Button onPress={...} />`
    instead of the HTML `<form onSubmit={...} />` component (since there is no
    `<form />` element in React Native).
2.  Formik's `handleChange` is passed to a `<TextInput onChangeText={...} />` instead of the HTML `<input onChange={...} />` component since we only need the updated text from the input rather than the whole event (although Formik will also work with `<TextInput onChange={handleChange} / >`).

### The `useField` hook

We can also take advantage of Formik's `useField` hook in React Native. Take the following example:

```jsx
// Formik x React Native with hooks
import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { Formik, useField } from 'formik';

const MyCustomTextInput = ({ name, label }) => {
  const [field, meta, helpers] = useField(name);

  return (
    <>
      <Text>{label}</Text>
      <TextInput
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        value={field.value}
      />
      {meta.error && meta.touched && <Text>{meta.error}</Text>}
    </>
  );
};

export const MyReactNativeForm = props => (
  <Formik
    initialValues={{ email: '' }}
    onSubmit={values => console.log(values)}
  >
    {({ handleSubmit }) => (
      <View>
        <MyCustomTextInput name="email" label="Email" />
        <Button onPress={handleSubmit} title="Submit" />
      </View>
    )}
  </Formik>
);
```
