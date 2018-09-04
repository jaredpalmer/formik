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
import { withFormik } from 'formik';

const enhancer = withFormik({
  /*...*/
});

const MyReactNativeForm = props => (
  <View>
    <TextInput
      onChangeText={props.handleChange('email')}
      onBlur={props.handleBlur('email')}
      value={props.values.email}
    />
    <Button onPress={props.handleSubmit} title="Submit" />
  </View>
);

export default enhancer(MyReactNativeForm);
```

As you can see above, the notable differences between using Formik with React
DOM and React Native are:

1.  Formik's `props.handleSubmit` is passed to a `<Button onPress={...} />`
    instead of HTML `<form onSubmit={...} />` component (since there is no
    `<form />` element in React Native).
2.  `<TextInput />` uses Formik's `props.handleChange(fieldName)` and `handleBlur(fieldName)` instead of directly assigning the callbacks to props, because we have to get the `fieldName` from somewhere and with ReactNative we can't get it automatically like for web (using input name attribute). You can also use `setFieldValue(fieldName, value)` and `setTouched(fieldName, bool)` as an alternative.

### Wrapping React Native's `<TextInput />`

```jsx
// FormikReactNativeTextInput.js
import * as React from 'react';
import { View, Text, TextInput } from 'react-native';
import { FormikConsumer } from 'formik';

class FormikNativeInput extends React.Component {
  render() {
    // we want to pass through all the props except for onChangeText
    const { onChangeText, name, ...otherProps } = this.props;
    return (
      <FormikConsumer>
        {formikProps => (
          <View>
            <TextInput
              onChangeText={formikProps.handleChange(name)}
              onBlur={formikProps.handleBlur(name)}
              value={formikProps.values[name]}
              {...otherProps}
            />
            {/* Might as well handle logic around validation errors here!*/
            formikProps.touched[name] && formikProps.errors[name] ? (
              <Text>{formikProps.errors[name]}</Text>
            ) : null}
          </View>
        )}
      </FormikConsumer>
    );
  }
}
```

Then you could just use this custom input as follows:

```jsx
// MyReactNativeForm.js
import { View, Button } from 'react-native';
import FormikNativeInput from './FormikNativeInput';
import { Formik } from 'formik';

const MyReactNativeForm = props => (
  <View>
    <Formik
      onSubmit={(values, actions) => {
        setTimeout(() => {
          console.log(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
      render={props => (
        <View>
          <FormikNativeInput name="email" />
          <Button title="submit" onPress={props.handleSubmit} />
        </View>
      )}
    />
  </View>
);

export default MyReactNativeForm;
```
