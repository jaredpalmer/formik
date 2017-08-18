![](https://user-images.githubusercontent.com/4060187/27243721-3b5219d0-52b1-11e7-96f1-dae8391a3ef6.png)

[![gzip size](http://img.badgesize.io/https://unpkg.com/formik/dist/formik.umd.min.js?compression=gzip)](https://unpkg.com/formik/dist/formik.umd.min.js)
[![Build Status](https://travis-ci.org/jaredpalmer/formik.svg?branch=master)](https://travis-ci.org/jaredpalmer/formik)
[![npm](https://img.shields.io/npm/v/formik.svg)](https://npm.im/formik)
[![license](http://img.shields.io/npm/l/formik.svg)](./LICENSE)
[![Join the chat at on Slack](https://palmer.chat/badge.svg)](https://palmer.chat/)

Let's face it, forms are really verbose in [React](https://github.com/facebook/react). To make matters worse, most form helpers do wayyyy too much magic and often have a significant performance cost associated with them. Formik is a minimal Higher Order Component that helps you with the 3 most annoying parts:

 1. Transforming props to form state
 2. Validation and error messages
 3. Handling form submission

By colocating all of the above in one place, Formik will keep things organized--making testing, refactoring, and reasoning about your forms a breeze.

## Installation

Add Formik (and optionally [Yup](https://github.com/jquense/yup) to your project). Formik supports/recommends [Yup](https://github.com/jquense/yup) (which is like [Joi](https://github.com/hapijs/joi), but for the browser) for object schema validation.

```bash
npm i formik yup --save
```
Note: Yup is 100% optional. You are free to [write your own validators][`validate`].

You can also try before you buy with this **[demo of Formik on CodeSandbox.io](https://codesandbox.io/s/zKrK5YLDZ)**

## Demos

- [Basic](https://codesandbox.io/s/zKrK5YLDZ)
- [Sync Validation](https://codesandbox.io/s/q8yRqQMp)
- [Building your own input primitives](https://codesandbox.io/s/qJR4ykJk)
- [Working with 3rd-party inputs #1: react-select](https://codesandbox.io/s/jRzE53pqR)
- [Working with 3rd-party inputs #2: Draft.js](https://codesandbox.io/s/QW1rqjBLl)
- [Accessing React lifecycle functions](https://codesandbox.io/s/pgD4DLypy)

---

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Usage](#usage)
  - [Simple Example](#simple-example)
- [API](#api)
  - [`Formik(options)`](#formikoptions)
    - [`options`](#options)
      - [`displayName?: string`](#displayname-string)
      - [`handleSubmit: (values: Values, formikBag: FormikBag) => void`](#handlesubmit-values-values-formikbag-formikbag--void)
        - [The "FormikBag":](#the-formikbag)
      - [`isInitialValid?: boolean | (props: Props) => boolean`](#isinitialvalid-boolean--props-props--boolean)
      - [`mapPropsToValues?: (props: Props) => Values`](#mappropstovalues-props-props--values)
      - [`validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`](#validate-values-values-props-props--formikerrorvalues--promiseany)
      - [`validateOnBlur?: boolean`](#validateonblur-boolean)
      - [`validateOnChange?: boolean`](#validateonchange-boolean)
      - [`validationSchema?: Schema | ((props: Props) => Schema)`](#validationschema-schema--props-props--schema)
    - [Injected props and methods](#injected-props-and-methods)
      - [`dirty: boolean`](#dirty-boolean)
      - [`errors: { [field: string]: string }`](#errors--field-string-string-)
      - [`handleBlur: (e: any) => void`](#handleblur-e-any--void)
      - [`handleChange: (e: React.ChangeEvent<any>) => void`](#handlechange-e-reactchangeeventany--void)
      - [`handleReset: () => void`](#handlereset---void)
      - [`handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`](#handlesubmit-e-reactformeventhtmlformevent--void)
      - [`isSubmitting: boolean`](#issubmitting-boolean)
      - [`isValid: boolean`](#isvalid-boolean)
      - [`resetForm: (nextProps?: Props) => void`](#resetform-nextprops-props--void)
      - [`setErrors: (fields: { [field: string]: string }) => void`](#seterrors-fields--field-string-string---void)
      - [`setFieldError: (field: string, errorMsg: string) => void`](#setfielderror-field-string-errormsg-string--void)
      - [`setFieldTouched: (field: string, isTouched: boolean) => void`](#setfieldtouched-field-string-istouched-boolean--void)
      - [`setFieldValue: (field: string, value: any) => void`](#setfieldvalue-field-string-value-any--void)
      - [`setStatus: (status?: any) => void`](#setstatus-status-any--void)
      - [`setSubmitting: (boolean) => void`](#setsubmitting-boolean--void)
      - [`setTouched: (fields: { [field: string]: boolean }) => void`](#settouched-fields--field-string-boolean---void)
      - [`setValues: (fields: { [field: string]: any }) => void`](#setvalues-fields--field-string-any---void)
      - [`status?: any`](#status-any)
      - [`touched: { [field: string]: boolean }`](#touched--field-string-boolean-)
      - [`values: { [field: string]: any }`](#values--field-string-any-)
- [Recipes](#recipes)
  - [Ways to call `Formik`](#ways-to-call-formik)
  - [Accessing React Component Lifecycle Functions](#accessing-react-component-lifecycle-functions)
    - [Example: Resetting a form when props change](#example-resetting-a-form-when-props-change)
  - [React Native](#react-native)
    - [Why use `setFieldValue` instead of `handleChange`?](#why-use-setfieldvalue-instead-of-handlechange)
    - [Avoiding a Render Callback](#avoiding-a-render-callback)
  - [Testing Formik](#testing-formik)
    - [Dummy Form](#dummy-form)
    - [Simulating input](#simulating-input)
    - [Simulating form submission](#simulating-form-submission)
- [Authors](#authors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

### Simple Example

Imagine you want to build a form that lets you edit user data. However, your user API has nested objects like so.

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

When we are done we want our form to accept just a `user` prop and that's it.   

```js
// User.js
import React from 'react';
import Dialog from 'MySuperDialog';
import EditUserForm from './EditUserForm';

const EditUserDialog = ({ user }) =>
  <Dialog>
    <EditUserForm user={user} />
  </Dialog>;
```

Enter Formik.

```js
// EditUserForm.js
import React from 'react';
import { Formik } from 'formik';
import Yup from 'yup';

// Formik is a Higher Order Component that wraps a React form. Mutable form values
// are injected into a prop called [`values`]. Additionally, Formik injects
// onChange and an onBlur handler that you can use on every input. You also get
// handleSubmit, handleReset, errors, touched, and isSubmitting for free. This makes building custom
// inputs easy.
const EditUserForm = ({
  values,
  touched,
  errors,
  dirty,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
  handleReset,
}) =>
  <form onSubmit={handleSubmit}>
    <label htmlFor="email">Email</label>
    <input
      id="email"
      placeholder="Enter your email"
      type="text"
      value={values.email}
      onChange={handleChange}
      onBlur={handleBlur}
    />
    {errors.email &&
      touched.email &&
      <div>
        {errors.email}
      </div>}
    <input
      type="text"
      name="facebook"
      value={values.facebook}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="facebook username"
    />
    {errors.facebook &&
      touched.facebook &&
      <div>
        {errors.facebook}
      </div>}
    <input
      type="text"
      name="twitter"
      value={values.twitter}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="twitter username"
    />
    {errors.twitter &&
      touched.twitter &&
      <div>
        {errors.twitter}
      </div>}
    <button
      type="button"
      onClick={handleReset}
      disabled={!dirty || isSubmitting}
    >
      Reset
    </button>
    <button type="submit" disabled={isSubmitting}>
      Submit
    </button>
  </form>;

// Now for the fun part. We need to tell Formik how we want to validate,
// transform props/state, and submit our form.
export default Formik({
  // We now map React props to form values. These will be injected as [`values`] into
  // our form. (Note: in the real world, you would destructure props, but for clarity this is
  // not shown)
  mapPropsToValues: props => ({
    email: props.user.email,
    twitter: props.user.social.twitter,
    facebook: props.user.social.facebook,
  }),
  // We can optionally define our a validation schema with Yup. It's like Joi, but for
  // the browser. Errors from Yup will be injected as `errors` into the form.
  validationSchema: Yup.object().shape({
    email: Yup.string().email().required('Bruh, email is required'),
    twitter: Yup.string(),
    facebook: Yup.string(),
  }),
  // Formik lets you colocate your submission handler with your form.
  // In addition to your from `values`, you have
  // access to all props and some stateful helpers.
  handleSubmit: (values, { props, setErrors, setSubmitting }) => {
    // do stuff with your payload
    // e.preventDefault(), setSubmitting, setError(undefined) are
    // called before handleSubmit is. So you don't have to do repeat this.
    // handleSubmit will only be executed if form values pass validation (if you specify it).
    CallMyApi(props.user.id, values).then(
      res => {
        setSubmitting(false);
        // do something to show success
        // MyToaster.showSuccess({ message: 'Success!' })
      },
      err => {
        setSubmitting(false);
        setErrors(transformMyAPIErrorToAnObject(err));
        // do something to show a rejected api submission
        // MyToaster.showError({ message: 'Shit!', error: err })
      }
    );
  },
})(EditUserForm);
```

## API

### `Formik(options)`

Create a higher-order React component class that passes props and form handlers (the "`FormikBag`") into your component derived from supplied options.

#### `options`

##### `displayName?: string`
When your inner form component is a stateless functional component, you can use the `displayName` option to give the component a proper name so you can more easily find it in [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en). If specified, your wrapped form will show up as `Formik(displayName)`. If omitted, it will show up as `Formik(Component)`. This option is not required for class components (e.g. `class XXXXX extends React.Component {..}`).

##### `handleSubmit: (values: Values, formikBag: FormikBag) => void`
Your form submission handler. It is passed your forms [`values`] and the "FormikBag", which includes an object containing a subset of the [injected props and methods](/#injected-props-and-methods) (i.e. all the methods with names that start with `set<Thing>` + `resetForm`) and any props that were passed to the the wrapped component.

###### The "FormikBag":

- `props` (props passed to the wrapped component)
- [`resetForm`]
- [`setErrors`]
- [`setFieldError`]
- [`setFieldTouched`]
- [`setFieldValue`]
- [`setStatus`]
- [`setSubmitting`]
- [`setTouched`]
- [`setValues`]

Note: [`errors`], [`touched`], [`status`] and all event handlers are NOT included in the `FormikBag`.

##### `isInitialValid?: boolean | (props: Props) => boolean`

Default is `false`. Control the initial value of [`isValid`] prop prior to mount. You can also pass a function. Useful for situations when you want to enable/disable a submit and reset buttons on initial mount.

##### `mapPropsToValues?: (props: Props) => Values`

If this option is specified, then Formik will transfer its results into updatable form state and make these values available to the new component as [`props.values`][`values`]. If `mapPropsToValues` is not specified, then Formik will map all props that are not functions to the inner component's [`props.values`][`values`]. That is, if you omit it, Formik will only pass `props` where `typeof props[k] !== 'function'`, where `k` is some key.

Even if your form is not receiving any props from its parent, use `mapPropsToValues` to initialize your forms empty state.

##### `validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`

_Note: I suggest using [`validateSchema`] and Yup for validation. However, `validate` is a dependency-free, straightforward way to validate your forms._

Validate the form's [`values`] with function. This function can either be:

1. Synchronous and return an [`errors`] object.

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
```
- Asynchronous and return a Promise that's error is an [`errors`] object

```js
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

##### `validateOnBlur?: boolean`

Default is `true`. Use this option to run validations on `blur` events. More specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`] are called.

##### `validateOnChange?: boolean`

Default is `false`. Use this option to tell Formik to run validations on `change` events and `change`-related methods. More specifically, when either [`handleChange`], [`setFieldValue`], or [`setValues`] are called.

##### `validationSchema?: Schema | ((props: Props) => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup schema. This is used for validation. Errors are mapped by key to the inner component's [`errors`]. Its keys should match those of [`values`].

#### Injected props and methods

The following list of properties and methods will be injected into the your inner form component as React props after you "enhance"/wrap it with the Formik HoC.

- If your inner form component is a stateless function, then each item will be made available as `props.xxxx`.
- If your inner form component is an ES6 class, then each item below will be made available as `this.props.xxxx`.

Any additional props you pass to your wrapped component (including those props you do not map to form state via [`mapPropsToVales`]) are passed directly down untouched.

##### `dirty: boolean`

Returns `true` if any field has been touched by any means, `false` otherwise. `dirty` is a readonly computed property and should not be mutated directly.

##### `errors: { [field: string]: string }`

Form validation errors. Should match the shape of your form's [`values`] defined in Formik options. If you are using [`validationSchema`] (which you should be), keys and shape will match your schema exactly. Internally, Formik transforms raw [Yup validation errors](https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string) on your behalf. If you are using [`validate`], then that function will determine the `errors` objects shape.

##### `handleBlur: (e: any) => void`
`onBlur` event handler. Useful for when you need to track whether an input has been [`touched`] or not. This should be passed to `<input onBlur={handleBlur} ... />`

DOM-only. Use [`setFieldTouched`] in React Native.

##### `handleChange: (e: React.ChangeEvent<any>) => void`
General input change event handler. This will update the `values[key]` where `key` is the event-emitting input's `name` attribute. If the `name` attribute is not present, `handleChange` will look for an input's `id` attribute. Note: "input" here means all HTML inputs.

DOM-only. Use [`setFieldValue`] in React Native.

##### `handleReset: () => void`
Reset handler. Will reset the form to its initial state. This should be passed to `<button onClick={handleReset}>...</button>`

##### `handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`
Submit handler. This should be passed to `<form onSubmit={handleSubmit}>...</form>`

##### `isSubmitting: boolean`
Submitting state. Either `true` or `false`. Formik will set this to `true` on your behalf before calling [`handleSubmit`] to reduce boilerplate.

##### `isValid: boolean`

Returns `true` if the there are no [`errors`], or the result of [`isInitialValid`] the form if is in "pristine" condition (i.e. not [`dirty`])).

##### `resetForm: (nextProps?: Props) => void`
Imperatively reset the form. This will clear [`errors`] and [`touched`], set [`isSubmitting`] to `false` and rerun `mapPropsToValues` with the current `WrappedComponent`'s `props` or what's passed as an argument. That latter is useful for calling `resetForm` within `componentWillReceiveProps`.

##### `setErrors: (fields: { [field: string]: string }) => void`
Set `errors` imperatively.

##### `setFieldError: (field: string, errorMsg: string) => void`
Set the error message of a field imperatively. `field` should match the key of [`errors`] you wish to update.  Useful for creating custom input error handlers.

##### `setFieldTouched: (field: string, isTouched: boolean) => void`
Set the touched state of a field imperatively. `field` should match the key of [`touched`] you wish to update.  Useful for creating custom input blur handlers.

##### `setFieldValue: (field: string, value: any) => void`
Set the value of a field imperatively. `field` should match the key of [`values`] you wish to update.  Useful for creating custom input change handlers.

##### `setStatus: (status?: any) => void`
Set a top-level [`status`] to anything you want imperatively. Useful for controlling arbitrary top-level state related to your form. For example, you can use it to pass API responses back into your component in [`handleSubmit`].

##### `setSubmitting: (boolean) => void`
Set [`isSubmitting`] imperatively.

##### `setTouched: (fields: { [field: string]: boolean }) => void`
Set [`touched`] imperatively.

##### `setValues: (fields: { [field: string]: any }) => void`
Set [`values`] imperatively.

##### `status?: any`
A top-level status object that you can use to represent form state that can't otherwised be expressed/stored with other methods. This is useful for capturing and passing through API responses to your inner component.

`status` should only be modifed by calling [`setStatus: (status?: any) => void`](#setstatus-status-any--void)

##### `touched: { [field: string]: boolean }`
Touched fields. Each key corresponds to a field that has been touched/visited.

##### `values: { [field: string]: any }`
Your form's values. Will have the shape of the result of [`mapPropsToValues`] (if specified) or all props that are not functions passed to your wrapped component.

## Recipes

### Ways to call `Formik`

Formik is a Higher Order Component factory; you can use it exactly like React Redux's `connect` or Apollo's `graphql`. There are three ways to call Formik on your component:

You can assign the HoC returned by Formik to a variable (i.e. `withFormik`) for later use.

```js
import React from 'react';
import { Formik } from 'formik';

// Assign the HoC returned by Formik to a variable
const withFormik = Formik(
  {
    /*...*/
  }
);

// Your form
const MyForm = props =>
  <form onSubmit={props.handleSubmit}>
    <input
      type="text"
      name="thing"
      value={props.values.thing}
      onChange={props.handleChange}
    />
    <input type="submit" value="Submit" />
  </form>;

// Use HoC by passing your form to it as an argument.
export default withFormik(MyForm);
```

You can also skip a step and immediately invoke Formik instead of assigning it to a variable. This method has been popularized by React Redux. One downside is that when you read the file containing your form, its props seem to come out of nowhere.

```js
import React from 'react';
import { Formik } from 'formik';

// Your form
const MyForm = props =>
  <form onSubmit={props.handleSubmit}>
    <input
      type="text"
      name="thing"
      value={props.values.thing}
      onChange={props.handleChange}
    />
    <input type="submit" value="Submit" />
  </form>;

// Configure and call Formik immediately
export default Formik(
  {
    /*...*/
  }
)(MyForm);
```

Lastly, you can define your form component anonymously:

```js
import React from 'react';
import { Formik } from 'formik';

// Configure and call Formik immediately
export default Formik(
  {
    /*...*/
  }
)(props =>
  <form onSubmit={props.handleSubmit}>
    <input
      type="text"
      name="thing"
      value={props.values.thing}
      onChange={props.handleChange}
    />
    <input type="submit" value="Submit" />
  </form>
);
```

I suggest using the first method, as it makes it clear what Formik is doing. It also lets you configure Formik above your component, so when you read your form's code, you know where those props are coming from. It also makes testing much easier.

### Accessing React Component Lifecycle Functions

Sometimes you need to access [React Component Lifecycle methods](https://facebook.github.io/react/docs/react-component.html#the-component-lifecycle) to manipulate your form. In this situation, you have some options:

- Lift that lifecycle method up into a React class component that's child is your Formik-wrapped form and pass whatever props it needs from there
- Convert your form into a React component class (instead of a stateless functional component) and wrap that class with Formik.

There isn't a hard rule whether one is better than the other. The decision comes down to whether you want to colocate this logic with your form or not. (Note: if you need `refs` you'll need to convert your stateless functional form component into a React class anyway).

#### Example: Resetting a form when props change

```js
// Reset form when a certain prop changes
import React from 'react';
import { Formik } from 'formik';

const withFormik = Formik(
  {
    /*...*/
  }
);

class MyForm extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.thing !== this.props.thing) {
      this.props.resetForm(nextProps);
    }
  }

  render() {
    // Formik props are available on `this.props`
    return (
      <form onSubmit={this.props.handleSubmit}>
        <input
          type="text"
          name="otherThing"
          value={this.props.values.otherThing}
          onChange={this.props.handleChange}
        />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export default withFormik(MyForm);
```

As for colocating a React lifecycle method with your form, imagine a situation where you want to use if you have a modal that's only job is to display a form based on the presence of props or not.

### React Native

**Formik is 100% compatible with React Native and React Native Web.** However, because of differences between ReactDOM's and React Native's handling of forms and text input, there are two differences to be aware of. This section will walk you through them and what I consider to be best practices.

Before going any further, here's a super minimal gist of how to use Formik with React Native that demonstrates the key differences:

```js
// Formik x React Native example
import React from 'react';
import { Button, TextInput, View } from 'react-native';
import { Formik } from 'formik';

const withFormik = Formik(
  {
    /*...*/
  }
);

const MyReactNativeForm = props =>
  <View>
    <TextInput
      onChangeText={text => props.setFieldValue('email', text)}
      value={props.values.email}
    />
    <Button onPress={props.handleSubmit} title="Submit" /> //
  </View>;

export default withFormik(MyReactNativeForm);
```

As you can see above, the notable differences between using Formik with React DOM and React Native are:

1. Formik's `props.handleSubmit` is passed to a `<Button onPress={...}/>` instead of HTML `<form onSubmit={...}/>` component (since there is no `<form/>` element in React Native).
2. `<TextInput />` uses Formik's `props.setFieldValue` instead of `props.handleChange`. To understand why, see the discussion below.


#### Why use `setFieldValue` instead of `handleChange`?

'cuz [`handleChange`] will not work in React Native...

```js
import { Button, TextInput, View } from 'react-native';
import { Formik } from 'formik';

const withFormik = Formik(
  {
    /*...*/
  }
);

// This will NOT update the TextInput when the user types
const MyReactNativeForm = props =>
  <View>
    <TextInput
      name="email"
      onChangeText={props.handleChange}
      value={props.values.email}
    />
    <Button onPress={props.handleSubmit} title="submit" />
  </View>;

export default withFormik(MyReactNativeForm);
```

The reason is that Formik's [`handleChange`] function expects its first argument to be synthetic DOM event where the `event.target` is the DOM input element and `event.target.id` or `event.target.name` matches the field to be updated. Without this, [`handleChange`] will do nothing.

In React Native, neither [`<TextInput />`](https://facebook.github.io/react-native/docs/textinput.html)'s [`onChange`](https://facebook.github.io/react-native/docs/textinput.html#onchange) nor [`onChangeText`](https://facebook.github.io/react-native/docs/textinput.html#onchange) callbacks pass such an event or one like it to its callback. Instead, they do the following *(emphasis added)*:

> [`onChange?: function`](https://facebook.github.io/react-native/docs/textinput.html#onchange)  
> Callback that is called when the text input's text changes.
>
> [`onChangeText?: function`](https://facebook.github.io/react-native/docs/textinput.html#onchangetext)  
> Callback that is called when the text input's text changes. **Changed text is passed as an argument to the callback handler.**


However, Formik works just fine if you use `props.setFieldValue`! Philisophically, just treat React Native's `<TextInput/>` the same way you would any other 3rd party custom input element.

In conclusion, the following WILL work in React Native:

```js
// ...
// this works.
export const MyReactNativeForm = props =>
  <View>
    <TextInput
      onChangeText={text => props.setFieldValue('email', text)}
      value={props.values.email}
    />
    <Button onPress={props.handleSubmit} />
  </View>;
// ...
```

#### Avoiding a Render Callback

If you are like me and do not like render callbacks, I suggest treating React Native's `<TextInput/>` as if it were another 3rd party custom input element:

  - Write your own class wrapper around the custom input element
  - Pass the custom component [`props.setFieldValue`][`setFieldValue`] instead of [`props.handleChange`][`handleChange`]
  - Use a custom change handler callback that calls whatever you passed-in `setFieldValue` as (in this case we'll match the React Native TextInput API and call it `this.props.onChangeText` for parity).

```tsx
// FormikReactNativeTextInput.tsx
import * as React from 'react'
import { TextInput } from 'react-native'

interface FormikReactNativeTextInputProps {
  /** Current value of the input */
  value: string;
  /** Change handler (this will be Formik's setFieldValue ;) ) */
  onChangeText: (value: string) => void;
  /** The name of the Formik field to be updated upon change */
  name: string;
  ...
  // the rest of the React Native's `TextInput` props
}

export default class FormikReactNativeTextInput extends React.Component<FormikReactNativeTextInputProps, {}> {
    handleChange = (value: string) => {
       // remember that onChangeText will be Formik's setFieldValue
       this.props.onChangeText(this.props.name, value)
    }

    render() {
     // we want to pass through all the props except for onChangeText
      const { onChangeText, ...otherProps } = this.props
      return (
        <TextInput
          onChangeText={this.handleChange}
          {...otherProps} // IRL, you should be more explicit when using TS
        />
      );
    }
}
```


Then you could just use this custom input as follows:

```tsx
// MyReactNativeForm.tsx
import { View, Button } from 'react-native'
import { FormikReactNativeTextInput as TextInput } from './FormikReactNativeTextInput'
import { Formik, InjectedFormikProps } from 'formik'

interface Props {...}
interface Values {...}

export const MyReactNativeForm: React.SFC<InjectedFormikProps<Props, Values>> = (props) => (
  <View>
    <TextInput
      name="email"
      onChangeText={props.setFieldValue}
      value={props.values.email}
    />
    <Button onPress={props.handleSubmit} />
  </View>
)

export default Formik<Props, Values>({ ... })(MyReactNativeForm)
```

### Testing Formik

_This section is a work in progress._

The suggested approach to testing Formik forms is with Airbnb's [Enzyme](https://github.com/airbnb/enzyme) test utility library.

The documentation and examples in this guide use Facebook's [Jest](https://facebook.github.io/jest) test runner. However, feel free to use [mocha](https://mochajs.org/) and [chai](http://chaijs.com/) if you prefer that.

To get started with Enzyme, you can simply install it with npm:

```bash
npm i  enzyme --save-dev
```

If you are using React >=15.5, in addition to enzyme, you will have to ensure that you also have the following npm modules installed if they were not already:

```bash
npm i react-test-renderer react-dom  --save-dev
```

####  Dummy Form
Imagine we have a basic form with one field `name`.

```js
// MyForm.js
import { Formik } from 'formik';
import Yup from 'yup';

export const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Must be longer than 2 characters')
    .max(30, "No one's name is that long")
    .required('Required'),
});

export const handleSubmit = (values, { setSubmitting }) => {
  setTimeout(() => {
    setSubmitting(false);
  }, 1000);
};

export const mapPropsToValues = props => ({ name: '' });

export const MyFormInner = ({
  values,
  handleSubmit,
  handleChange,
  handleBlur,
  setStatus,
  status,
  errors,
  isSubmitting,
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        name="name"
      />
      {errors.name &&
        <div id="feedback">
          {errors.name}
        </div>}
      {isSubmitting && <div id="submitting">Submitting</div>}
      {status &&
        !!status.myStatusMessage &&
        <div id="status">
          {status.myStatusMessage}
        </div>}
      <button type="submit">Submit</button>
    </form>
  );
};

export default Formik({
  mapPropsToValues,
  validationSchema,
  handleSubmit,
})(MyFormInner);
```

#### Simulating input

We can test that our UI is updating properly by using Enzyme's `shallow` renderer in addition to its `dive()` and `simulate()` methods. This lets us render the Formik-enhanced form, but then jump down and run simulations and assertions from the perspective of your inner form.

```js
// MyForm.test.js
import MyForm, { MyInnerForm } from './MyForm';

describe('MyForm', () => {
  test('should update an input when it is changed', () => {
    const tree = shallow(<MyForm />);

    tree.find(MyInnerForm).dive().find('input').simulate('change', {
      // you must add this next line as (Formik calls e.persist() internally)
      persist: () => {},
      // simulate changing e.target.name and e.target.value
      target: {
        name: 'name',
        value: 'ian',
      },
    });

    const newValue = tree.find(MyInnerForm).dive().find('input').props().value;

    expect(newValue).toEqual('ian');
  });
});

```

#### Simulating form submission

```js
// MyForm.test.js
import MyForm, { MyInnerForm, validationSchema } from './MyForm';

describe('MyForm', () => {
  test('submits the form', () => {
    const tree = shallow(<MyForm />);
    expect(tree.find(MyInnerForm).dive().find('#submitting')).toHaveLength(0);

    // simulate submit event. this is always sync! async calls to setState are swallowed.
    // be careful of false positives
    tree.find(MyInnerForm).dive().find('form').simulate('submit', {
      preventDefault: () => {}, // no op
    });

    // Because the simulated event is 100% sync, we can use it to test the synchronous changes
    // here. Any async stuff you do inside handleSubmit will be swallowed. Thus our UI
    // will see the following changes:
    // - isSubmitting -> true (even if you set it to false asynchronously in your handleSubmit)
    // - touched: all fields
    expect(tree.find(Form).dive().find('#submitting')).toHaveLength(1);
    expect(
      tree.find(Form).dive().find('button[type="submit"]').props().disabled
    ).toBe(true);
  });

  test('what happens when the form is submitted', async () => {
    const tree = shallow(<MyForm />);

    expect(tree.find(MyInnerForm).dive().find('#submitting')).toHaveLength(0);

    await mockCallsToMyApi();
    await tree.find(MyInnerForm).props().submitForm();

    // check that ui has completely updated
    expect(
      tree.find(MyInnerForm).update().dive().find('#submitting')
    ).toHaveLength(0);
    expect(tree.find(MyInnerForm).update().dive().find('#status').text).toEqual(
      'Success!'
    );
    expect(
      tree
        .find(MyInnerForm)
        .update()
        .dive()
        .find('button[type="submit"]')
        .props().disabled
    ).toBe(false);

    // check that props have updated
    expect(tree.find(MyInnerForm).props().status).toEqual({
      myStatusMessage: 'Success!',
    });
    expect(tree.find(MyInnerForm).props().errors).toEqual({});
    expect(tree.find(MyInnerForm).props().touched).toEqual({ name: true }); // submit will touch all fields
  });
});
```

## Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)

MIT License.


[`displayName`]: #displayname-string
[`handleSubmit`]: #handlesubmit-payload-formikbag--void
[`FormikBag`]: #the-formikbag
[`isInitialValid`]: #isinitialvalid-boolean--props-props--boolean
[`mapPropsToValues`]: #mappropstovalues-props--props
[`validate`]: #validate-values-values-props-props--formikerrorvalues--promiseany
[`validateOnBlur`]: #validateonblur-boolean
[`validateOnChange`]: #validateonchange-boolean
[`validationSchema`]: #validationschema-schema--props-props--schema

[Injected props and methods]: #injected-props-and-methods

[`dirty`]: #dirty-boolean
[`errors`]: #errors--field-string-string-
[`handleBlur`]: #handleblur-e-any--void
[`handleChange`]: #handlechange-e-reactchangeeventany--void
[`handleReset`]: #handlereset---void
[`handleSubmit`]: #handlesubmit-e-reactformeventhtmlformevent--void
[`isSubmitting`]: #issubmitting-boolean
[`isValid`]: #isvalid-boolean
[`resetForm`]: #resetform-nextprops-props--void
[`setErrors`]: #seterrors-fields--field-string-string---void
[`setFieldError`]: #setfielderror-field-string-errormsg-string--void
[`setFieldTouched`]: #setfieldtouched-field-string-istouched-boolean--void
[`setFieldValue`]: #setfieldvalue-field-string-value-any--void
[`setStatus`]: #setstatus-status-any--void
[`setSubmitting`]: #setsubmitting-boolean--void
[`setTouched`]: #settouched-fields--field-string-boolean---void
[`setValues`]: #setvalues-fields--field-string-any---void
[`status`]: #status-any
[`touched`]: #touched--field-string-boolean-
[`values`]: #values--field-string-any-
