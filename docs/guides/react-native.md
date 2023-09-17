---
id: react-native
title: React Native
---

**Formik is 100% compatible with React Native and React Native Web.** However,
because of differences between ReactDOM's and React Native's handling of forms
and text input, there are some differences to be aware of. This section will walk
you through them and what we consider to be best practices.

### The gist

Before going any further, here's a super minimal gist of how to use Formik with
React Native that demonstrates the key differences:

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
    {({ setFieldValue, setFieldTouched, handleSubmit, values }) => (
      <View>
        <TextInput
          onChangeText={value => setFieldValue('email', value)}
          onBlur={() => setFieldTouched('email', true)}
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

1. Formik's `handleSubmit` is passed to a `<Button onPress={...} />`
   instead of HTML `<form onSubmit={...} />` component (since there is no
   `<form />` element in React Native).
2. `<TextInput />` must call `setFieldValue(fieldName, value)` and `setFieldTouched(fieldName, bool)` because Formik can't retrieve field names and values from DOM events, like in web (using input name attribute).
