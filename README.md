![](https://user-images.githubusercontent.com/4060187/27243721-3b5219d0-52b1-11e7-96f1-dae8391a3ef6.png)

#### Forms in React, *without tears.*

Let's face it, forms are really verbose in React. To make matters worse, most form helpers do wayyyy too much magic and often have a significant performance cost associated with them. Formik is a minimal Higher Order Component that helps you with the 3 most annoying parts: 

 1. Transforming props to a flat React state
 2. Validation and error messages
 3. Transforming a flat React state back into a consumable payload for your API

Lastly, Formik helps you stay organized by colocating all of the above plus your submission handler in one place. This makes testing, refactoring, and reasoning about your forms a breeze.

## Installation

Add Formik and Yup to your project. Formik uses [Yup](https://github.com/jquense/yup) (which is like [Joi](https://github.com/hapijs/joi), but for the browser) for schema validation. 

```bash
npm i formik yup --save
```

You can also try before you buy with this **[demo on CodeSandbox.io](https://codesandbox.io/s/zKrK5YLDZ)**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Usage](#usage)
  - [Simple Example](#simple-example)
- [API](#api)
  - [`Formik(options)`](#formikoptions)
    - [`options`](#options)
      - [`displayName?: string`](#displayname-string)
      - [`handleSubmit: (payload, FormikBag) => void`](#handlesubmit-payload-formikbag--void)
      - [`mapPropsToValues?: (props) => props`](#mappropstovalues-props--props)
      - [`mapValuesToPayload?: (values) => payload`](#mapvaluestopayload-values--payload)
      - [`validationSchema: Schema`](#validationschema-schema)
    - [Injected props and methods](#injected-props-and-methods)
      - [`error?: any`](#error-any)
      - [`errors: { [field: string]: string }`](#errors--field-string-string-)
      - [`handleBlur: (e: any) => void`](#handleblur-e-any--void)
      - [`handleChange: (e: React.ChangeEvent<any>) => void`](#handlechange-e-reactchangeeventany--void)
      - [`handleChangeValue: (name: string, value: any) => void`](#handlechangevalue-name-string-value-any--void)
      - [`handleReset: () => void`](#handlereset---void)
      - [`handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`](#handlesubmit-e-reactformeventhtmlformevent--void)
      - [`isSubmitting: boolean`](#issubmitting-boolean)
      - [`resetForm: (nextProps?: Props) => void`](#resetform-nextprops-props--void)
      - [`setError(err: any) => void`](#seterrorerr-any--void)
      - [`setErrors(fields: { [field: string]: string }) => void`](#seterrorsfields--field-string-string---void)
      - [`setSubmitting(boolean) => void`](#setsubmittingboolean--void)
      - [`setTouched(fields: { [field: string]: boolean }) => void`](#settouchedfields--field-string-boolean---void)
      - [`setValues(fields: { [field: string]: any }) => void`](#setvaluesfields--field-string-any---void)
      - [`touched: { [field: string]: boolean}`](#touched--field-string-boolean)
      - [`values: { [field: string]: any }`](#values--field-string-any-)
- [Recipes](#recipes)
  - [Ways to call `Formik`](#ways-to-call-formik)
  - [Accessing React Component Lifecycle Functions](#accessing-react-component-lifecycle-functions)
    - [Example: Resetting a form when props change](#example-resetting-a-form-when-props-change)
  - [React Native](#react-native)
    - [Why `handleChangeValue` instead of `handleChange`?](#why-handlechangevalue-instead-of-handlechange)
    - [Avoiding a Render Callback](#avoiding-a-render-callback)
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
     ....
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

// Formik is a Higher Order Component that wraps a React Form. Mutable form values 
// are injected into a prop called `values`. Additionally, Formik injects
// an onChange handler that you can use on every input. You also get
// handleSubmit, errors, and isSubmitting for free. This makes building custom
// inputs easy.
const SimpleForm = ({ values, handleChange, handleSubmit, handleReset, errors, error, isSubmitting }) =>
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      name="email"
      value={values.email}
      onChange={handleChange}
      placeholder="john@apple.com"
    />
    {errors.email && <div>{errors.email}</div>}
    <input
      type="text"
      name="facebook"
      value={values.facebook}
      onChange={handleChange}
      placeholder="facebook username"
    />
    {errors.facebook && <div>{errors.facebook}</div>}
    <input
      type="text"
      name="twitter"
      value={values.twitter}
      onChange={handleChange}
      placeholder="twitter username"
    />
    {errors.twitter && <div>{errors.twitter}</div>}
    {error && error.message && <div style={{color: 'red'}}>Top Level Error: {error.message}</div>}
    <button onClick={handleReset}>Reset</button>
    <button type="submit" disabled={isSubmitting}>Submit</button>
  </form>;

// Now for the fun part. We need to tell Formik how we want to validate,
// transform props/state, and submit our form.
export default Formik({
  // Define our form's validation schema with Yup. It's like Joi, but for
  // the browser.
  validationSchema: Yup.object().shape({
    email: Yup.string().email().required(),
    twitter: Yup.string(),
    facebook: Yup.string(),
  }),

  // We now map React props to form values. These will be injected as `values` into
  // our form. (Note: in the real world, you would destructure props, but for clarity this is
  // not shown)
  mapPropsToValues: props => ({
    email: props.user.email,
    twitter: props.user.social.twitter,
    facebook: props.user.social.facebook,
  }),

  // Sometimes your API needs a different object shape than your form. Formik lets 
  // you map `values` back into a `payload` before they are
  // passed to handleSubmit.
  mapValuesToPayload: values => ({
    email: values.email,
    social: { 
      twitter: values.twitter, 
      facebook: values.facebook,
    },
  }),

  // Formik lets you colocate your submission handler with your form.
  // In addition to the payload (the result of mapValuesToPayload), you have
  // access to all props and some stateful helpers.
  handleSubmit: (payload, { props, setError, setSubmitting }) => {
    // do stuff with your payload
    // e.preventDefault(), setSubmitting, setError(undefined) are 
    // called before handleSubmit is. So you don't have to do repeat this.
    // handleSubmit will only be executed if form values pass Yup validation.
    CallMyApi(props.user.id, payload)
      .then(
        res => {
          setSubmitting(false)
          // do something to show success
          // MyToaster.showSuccess({ message: 'Success!' })
        },
        err => {
          setSubmitting(false)
          setError(err)
          // do something to show a rejected api submission
          // MyToaster.showError({ message: 'Shit!', error: err })
        }
      )
  },
})(SimpleForm);
```

## API

### `Formik(options)`

Create a higher-order React component class that passes props and form handlers (the "`FormikBag`") into your component derived from supplied options. 

#### `options`

##### `displayName?: string` 
When your inner form component is a stateless functional component, you can use the `displayName` option to give the component a proper name so you can more easily find it in [React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en). If specified, your wrapped form will show up as `Formik(displayName)`. If omitted, it will show up as `Formik(Component)`. This option is not required for class components (e.g. `class XXXXX extends React.Component {..}`).

##### `handleSubmit: (payload, FormikBag) => void`
Your form submission handler. It is passed the result of `mapValuesToPayload` (if specified), or the result of `mapPropsToValues`, or all props that are not functions (in that order of precedence) and the "`FormikBag`".

##### `mapPropsToValues?: (props) => props`
If this option is specified, then Formik will transfer its results into updatable form state and make these values available to the new component as `props.values`. If `mapPropsToValues` is not specified, then Formik will map all props that are not functions to the new component's `props.values`. That is, if you omit it, Formik will only pass `props` where `typeof props[k] !== 'function'`, where `k` is some key.

##### `mapValuesToPayload?: (values) => payload`
If this option is specified, then Formik will run this function just before calling `handleSubmit`. Use it to transform your form's `values` back into a shape that's consumable for other parts of your application or API. If `mapValuesToPayload` **is not** specified, then Formik will map all `values` directly to `payload` (which will be passed to `handleSubmit`). While this transformation can be moved into `handleSubmit`, consistently defining it in `mapValuesToPayload` separates concerns and helps you stay organized.

##### `validationSchema: Schema`
[A Yup schema](https://github.com/jquense/yup). This is used for validation on each onChange event. Errors are mapped by key to the `WrappedComponent`'s `props.errors`. Its keys should almost always match those of `WrappedComponent's` `props.values`. 

#### Injected props and methods

The following props and methods will be injected into the `WrappedComponent` (i.e. your form):

##### `error?: any`
A top-level error object, can be whatever you need.

##### `errors: { [field: string]: string }`
Form validation errors. Keys match the shape of the `validationSchema` defined in Formik options. This should therefore also map to your `values` object as well. Internally, Formik transforms raw [Yup validation errors](https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string) on your behalf. 

##### `handleBlur: (e: any) => void`
`onBlur` event handler. Useful for when you need to track whether an input has been `touched` or not. This should be passed to `<input onBlur={handleBlur} ... />`

##### `handleChange: (e: React.ChangeEvent<any>) => void`
General input change event handler. This will update the form value according to an input's `name` attribute. If `name` is not present, `handleChange` will look for an input's `id` attribute. Note: "input" here means all HTML inputs.

##### `handleChangeValue: (name: string, value: any) => void`
Custom input change handler. Use this when you have custom inputs. `name` should match the key of form value you wish to update.

##### `handleReset: () => void`
Reset handler. This should be passed to `<button onClick={handleReset}>...</button>`

##### `handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`
Submit handler. This should be passed to `<form onSubmit={handleSubmit}>...</form>`

##### `isSubmitting: boolean`
Submitting state. Either `true` or `false`. Formik will set this to `true` on your behalf before calling `handleSubmit` to reduce boilerplate.

##### `resetForm: (nextProps?: Props) => void`
Imperatively reset the form. This will clear `errors` and `touched`, set `isSubmitting` to `false` and rerun `mapPropsToValues` with the current `WrappedComponent`'s `props` or what's passed as an argument. That latter is useful for calling `resetForm` within `componentWillReceiveProps`.

##### `setError(err: any) => void`
Set a top-level `error` object. This can only be done manually. It is an escape hatch.

##### `setErrors(fields: { [field: string]: string }) => void`
Set `errors` manually.

##### `setSubmitting(boolean) => void`
Set `isSubmitting` manually.

##### `setTouched(fields: { [field: string]: boolean }) => void`
Set `touched` manually.

##### `setValues(fields: { [field: string]: any }) => void`
Set `values` manually.

##### `touched: { [field: string]: boolean}`
Touched fields. Use this to keep track of which fields have been visited. Use `handleBlur` to toggle on a given input. Keys work like `errors` and `values`.

##### `values: { [field: string]: any }`
Your form's values, the result of `mapPropsToValues` (if specified) or all props that are not functions passed to your `WrappedComponent`.

## Recipes

### Ways to call `Formik`

Formik is a Higher Order Component factory; you can use it exactly like React Redux's `connect` or Apollo's `graphql`. There are three ways to call Formik on your component:

You can assign the HoC returned by Formik to a variable (i.e. `withFormik`) for later use.
```js
import React from 'react';
import Formik from 'formik';

// Assign the HoC returned by Formik to a variable
const withFormik = Formik({...}); 

// Your form
const MyForm = (props) => (
 <form onSubmit={props.handleSubmit}>
   <input type="text" name="thing" value={props.values.thing} onChange={props.handleChange} />
   <input type="submit" value="Submit"/>
 </form>
);

// Use HoC by passing your form to it as an argument.
export default withFormik(MyForm);
```

You can also skip a step and immediately invoke Formik instead of assigning it to a variable. This method has been popularized by React Redux. One downside is that when you read the file containing your form, its props seem to come out of nowhere.

```js
import React from 'react';
import Formik from 'formik';

// Your form
const MyForm = (props) => (
 <form onSubmit={props.handleSubmit}>
   <input type="text" name="thing" value={props.values.thing} onChange={props.handleChange} />
   <input type="submit" value="Submit"/>
 </form>
);

// Configure and call Formik immediately
export default Formik({...})(MyForm);
```

Lastly, you can define your form component anonymously:

```js
import React from 'react';
import Formik from 'formik';

// Configure and call Formik immediately
export default Formik({...})((props) => (
 <form onSubmit={props.handleSubmit}>
   <input type="text" name="thing" value={props.values.thing} onChange={props.handleChange} />
   <input type="submit" value="Submit"/>
 </form>
));
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
import Formik from 'formik'

const withFormik = Formik({...});

class MyForm extends React.Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.thing !== this.props.thing) {
      this.props.resetForm(nextProps)
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

**Formik is 100% compatible with React Native and React Native Web.** However, because of differences between ReactDOM's and React Native's handling of forms and text input, there are two differences to be aware of. This guide will walk you through them and what I consider to be best practices.

Before going any further, here's a super minimal gist of how to use Formik with React Native that demonstrates the key differences:

```js
// Formik x React Native example
import React from 'react'
import { Button, TextInput, View } from 'react-native'
import { Formik } from 'formik'

const withFormik = Formik({...})

const MyReactNativeForm = (props) => (
  <View>
    <TextInput 
      onChangeText={text => props.handleChangeValue('email', text)} 
      value={props.values.email}
    />
   <Button onPress={props.handleSubmit} title="Submit" /> // 
  </View>
)

export default withFormik(MyReactNativeForm)
```

As you can see above, the notable differences between using Formik with React DOM and React Native are:

1. Formik's `props.handleSubmit` is passed to a `<Button onPress={...}/>` instead of HTML `<form onSubmit={...}/>` component (since there is no `<form/>` element in React Native).
- `<TextInput />` uses Formik's `props.handleChangeValue` instead of `props.handleChange`. To understand why, see the discussion below.


#### Why `handleChangeValue` instead of `handleChange`?

**This does NOT work:**

```js

import { Button, TextInput, View } from 'react-native'
import { Formik } from 'formik'

const withFormik = Formik({...})

// This will not update the TextInput when the user types
const MyReactNativeForm = (props) => (
    <View>
        <TextInput 
           name="email"
           onChangeText={props.handleChange} 
           value={props.values.email} 
        />
       <Button onPress={props.handleSubmit} title="submit" />
    </View>
)

export default withFormik(MyReactNativeForm)
```

The reason is that Formik's `props.handleChange` function expects its first argument to be synthetic DOM event where the `event.target` is the DOM input element and `event.target.id` or `event.target.name` matches the field to be updated. Without this, `props.handleChange` will do nothing. 

In React Native, neither [`<TextInput />`](https://facebook.github.io/react-native/docs/textinput.html)'s [`onChange`](https://facebook.github.io/react-native/docs/textinput.html#onchange) nor [`onChangeText`](https://facebook.github.io/react-native/docs/textinput.html#onchange) callbacks pass such an event or one like it to its callback. Instead, they do the following *(emphasis added)*:

> [`onChange?: function`](https://facebook.github.io/react-native/docs/textinput.html#onchange)  
> Callback that is called when the text input's text changes.
> 
> [`onChangeText?: function`](https://facebook.github.io/react-native/docs/textinput.html#onchangetext)  
> Callback that is called when the text input's text changes. **Changed text is passed as an argument to the callback handler.**


However, Formik works just fine if you use `props.handleChangeValue`! Philisophically, just treat React Native's `<TextInput/>` the same way you would any other 3rd party custom input element.

**but this does:**

```js
...
// this works.
export const MyReactNativeForm = (props) => (
  <View>
    <TextInput 
      onChangeText={email => props.handleChangeValue('email', email) } 
      value={props.values.email} 
    />
    <Button onPress={props.handleSubmit} />
  </View>
)
...
```


#### Avoiding a Render Callback

If you are like me, and do not like render callbacks, I suggest treating React Native's `<TextInput/>` as if it were another 3rd party custom input element:
 
  - Write your own class wrapper around the custom input element
  - Pass the custom component `props.handleChangeValue` instead of `props.handleChange`
  - Use a custom change handler callback that calls whatever you passed-in `handleChangeValue` as (in this case we'll match the React Native TextInput API and call it `this.props.onChangeText` for parity).

```tsx
// FormikReactNativeTextInput.tsx
import * as React from 'react'
import { TextInput } from 'react-native'

interface FormikReactNativeTextInputProps {
  /** Current value of the input */
  value: string;
  /** Change handler (this will be Formik's handleChangeValue ;) ) */
  onChangeText: (value: string) => void;
  /** The name of the Formik field to be updated upon change */
  name: string;
  ... 
  // the rest of the React Native `TextInput` props
}

export default class FormikReactNativeTextInput extends React.Component<FormikReactNativeTextInputProps, {}> {
    handleChange = (value: string) => {
       // remember that onChangeText will be Formik's handleChangeValue
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
import { View } from 'react-native'
import Button from './MyButton' // Assume this just exists
import { FormikReactNativeTextInput as TextInput } from './FormikReactNativeTextInput'
import { Formik, InjectedFormikProps } from 'formik'

interface Props {...}
interface Values {...}
interface Payload {...}

export const MyReactNativeForm: React.SFC<InjectedFormikProps<Props, Values>> = (props) => (
    <View>
        <TextInput 
           name="email"
           onChangeText={props.handleChangeValue} 
           value={props.values.email} 
        />
       <Button onPress={props.handleSubmit} />
    </View>
)

export default Formik<Props, Values, Payload>({ ... })(MyReactNativeForm)
```



## Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)

MIT License. 
