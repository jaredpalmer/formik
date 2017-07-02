![](https://user-images.githubusercontent.com/4060187/27243721-3b5219d0-52b1-11e7-96f1-dae8391a3ef6.png)

#### Forms in React, *without tears.*

Let's face it, forms are really really verbose in React. To make matters worse, most form helpers do wayyyyy too much magic and often have a significant performace cost. Formik is minimal a Higher Order Component that helps you with the 3 most annoying parts: 

 1. Transforming props to a flat React state
 2. Validation and error messages
 3. Transforming a flat React state back into a consumable payload for your API

Lastly, Formik helps you stay organized by colocating all of the above plus your submission handler in one place. This makes testing, refactoring, and reasoning about your forms a breeze.

## Installation

Add Formik and Yup to your project. Formik uses [Yup](https://github.com/jquense/yup) ([Joi](https://github.com/hapijs/joi) for the browser) for schema validation. 

```bash
npm i formik yup --save
```

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Usage](#usage)
  - [Simple Example](#simple-example)
- [API](#api)
  - [`Formik(options)`](#formikoptions)
    - [`options`](#options)
      - [`displayName: string`](#displayname-string)
      - [`handleSubmit: (payload, FormikBag) => void`)](#handlesubmit-payload-formikbag--void)
      - [`mapPropsToValues?: (props) => props`](#mappropstovalues-props--props)
      - [`mapValuesToPayload?: (values) => payload`](#mapvaluestopayload-values--payload)
      - [`validationSchema: Schema`](#validationschema-schema)
    - [Injected props and methods](#injected-props-and-methods)
      - [`error?: any`](#error-any)
      - [`errors: { [field]: string }`](#errors--field-string-)
      - [`handleBlur: (e: any) => void`](#handleblur-e-any--void)
      - [`handleChange: (e: React.ChangeEvent<any>) => void`](#handlechange-e-reactchangeeventany--void)
      - [`handleChangeValue: (name: string, value: any) => void`](#handlechangevalue-name-string-value-any--void)
      - [`handleReset: () => void`](#handlereset---void)
      - [`handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`](#handlesubmit-e-reactformeventhtmlformevent--void)
      - [`isSubmitting: boolean`](#issubmitting-boolean)
      - [`resetForm: (nextProps?: Props) => void`](#resetform-nextprops-props--void)
      - [`setError(err: any) => void`](#seterrorerr-any--void)
      - [`setErrors(fields: { [field]: string }) => void`](#seterrorsfields--field-string---void)
      - [`setSubmitting(boolean) => void`](#setsubmittingboolean--void)
      - [`setTouched(fields: { [field]: string }) => void`](#settouchedfields--field-string---void)
      - [`setValues(fields: { [field]: any }) => void`](#setvaluesfields--field-any---void)
      - [`touched: { [field]: string }`](#touched--field-string-)
      - [`values: { [field]: any }`](#values--field-any-)
- [Recipes](#recipes)
  - [Ways to call `Formik`](#ways-to-call-formik)
  - [Accessing React Component Lifecycle Functions](#accessing-react-component-lifecycle-functions)
    - [Example: Resetting a form when props change](#example-resetting-a-form-when-props-change)
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

  // Sometimes your API needs a different object shape than your form. Formik let's 
  // you map `values` back into a `payload` before they are
  // passed to handleSubmit.
  mapValuesToPayload: values => ({
    email: values.email,
    social: { 
      twitter: values.twitter, 
      facebook: values.facebook 
    },
  }),

  // Formik lets you colocate your submission handler with your form.
  // In addition to the payload (the result of mapValuesToPayload), you have
  // access to all props and some stateful helpers.
  handleSubmit: (payload, { props, setError, setSubmitting }) => {
    // do stuff with your payload
    // e.preventDefault(), setSubmitting, setError(undefined) are // called before handleSubmit is. So you don't have to.
    // HandleSubmit will only be executed if form values pass Yup validation.
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

Create A higher-order React component class that passes props and form handlers (the "`FormikBag`") into your component derived from supplied options. 

#### `options`

##### `displayName?: string` 
Set the display name of your component.

##### `handleSubmit: (payload, FormikBag) => void`)
Your form submission handler. It is passed the result of `mapValuesToPayload` (if specified), or the result of `mapPropsToValues`, or all props that are not functions (in that order of precedence) and the "`FormikBag`".

##### `mapPropsToValues?: (props) => props`
If this option is specified, then Formik will transfer its results into updatable form state and make these values available to the new component as `props.values`. If `mapPropsToValues` is not specified, then Formik will map all props that are not functions to the new component's `props.values`. That is, if you omit it, Formik will only pass `props` where `typeof props[k] !== 'function'`, where `k` is some key.

##### `mapValuesToPayload?: (values) => payload`
If this option is specified, then Formik will run this function just before calling `handleSubmit`. Use it to transform the your form's `values` back into a shape that's consumable for other parts of your application or API. If `mapValuesToPayload` **is not** specified, then Formik will map all `values` directly to `payload` (which will be passed to `handleSubmit`). While this transformation can be moved into `handleSubmit`, consistently defining it in `mapValuesToPayload` separates concerns and helps you stay organized.

##### `validationSchema: Schema`
[A Yup schema](https://github.com/jquense/yup). This is used for validation on each onChange event. Errors are mapped by key to the `WrappedComponent`'s `props.errors`. Its keys should almost always match those of `WrappedComponent's` `props.values`. 

#### Injected props and methods

The following props and methods will be injected into the `WrappedComponent` (i.e. your form):

##### `error?: any`
A top-level error object, can be whatever you need.

##### `errors: { [field]: string }`
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

##### `setErrors(fields: { [field]: string }) => void`
Set `errors` manually.

##### `setSubmitting(boolean) => void`
Set a `isSubmitting` manually.

##### `setTouched(fields: { [field]: string }) => void`
Set `touched` manually.

##### `setValues(fields: { [field]: any }) => void`
Set `values` manually.

##### `touched: { [field]: string }`
Touched fields. Use this to keep track of which fields have been visited. Use `handleBlur` to toggle on a given input. Keys work like `errors` and `values`.

##### `values: { [field]: any }`
Your form's values, the result of `mapPropsToValues` (if specified) or all props that are not functions passed to your `WrappedComponent`.

## Recipes

### Ways to call `Formik`

Formik is a Higher Order Component factory or "Monad" in functional programming lingo. In practice, you use it exactly like React Redux's `connect` or Apollo's `graphql`. There are basically three ways to call Formik on your component:

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

You can also skip a step and immediately invoke (i.e. "curry") Formik instead of assigning it to a variable. This method has been popularized by React Redux. One downside is that when you read the file containing your form, its props seem to come out of nowhere.

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

I suggest using the first method, as it makes it clear what Formik is doing. It also let's you configure Formik above your component, so when you read your form's code, you know where those props are coming from. It also makes testing much easier.

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
          name="thing"
          value={this.props.values.thing}
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


## Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)

MIT License. 
