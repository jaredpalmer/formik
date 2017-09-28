![](https://user-images.githubusercontent.com/4060187/27243721-3b5219d0-52b1-11e7-96f1-dae8391a3ef6.png)

[![gzip size](http://img.badgesize.io/https://unpkg.com/formik/dist/formik.umd.min.js?compression=gzip)](https://unpkg.com/formik/dist/formik.umd.min.js)
[![Build Status](https://travis-ci.org/jaredpalmer/formik.svg?branch=master)](https://travis-ci.org/jaredpalmer/formik)
[![npm](https://img.shields.io/npm/v/formik.svg)](https://npm.im/formik)
[![license](http://img.shields.io/npm/l/formik.svg)](./LICENSE)
[![Join the chat at on Slack](https://palmer.chat/badge.svg)](https://palmer.chat/)

## Overview

Let's face it, forms are really verbose in [React](https://github.com/facebook/react). To make matters worse, most form helpers do wayyyy too much magic and often have a significant performance cost associated with them. Formik is a small library that helps you with the 3 most annoying parts:

 1. Getting values in and out of form state
 2. Validation and error messages
 3. Handling form submission

By colocating all of the above in one place, Formik will keep things organized--making testing, refactoring, and reasoning about your forms a breeze.

## Developer Experience

I wrote Formik while building a large internal administrative dashboard with [Ian White](https://github.com/eonwhite). With around ~30 unique forms, it quickly became obvious that we could benefit by standardizing not just our input components but also the way in which data flowed through our forms.

By now, you might be thinking, "Why didn't you just use [Redux-Form](https://github.com/erikras/redux-form)?" Good question.

 1. According to our prophet Dan Abramov, [**form state is inherently emphemeral and local**, so tracking it in Redux is  unecessary](https://github.com/reactjs/redux/issues/1287#issuecomment-175351978)
 2. Redux-Form calls your entire top-level reducer multiple times ON EVERY KEYSTROKE. This is fine for small apps, but as your Redux app grows, input latency will continue increase if you use Redux-Form
 3. I no longer use [Redux](https://github.com/reactjs/redux) or [MobX](https://mobx.js.org/), just React's setState.
 4. Redux-Form is 22.5 kB minified gzipped (Formik is 9.2 kB)

My goal with Formik was to create a scalable, performant, form helper with a minimal API that does the really really annoying stuff, and leaves the rest up to you.

## Influences

Formik started by expanding on [this little higher order component](https://github.com/jxnblk/rebass-recomposed/blob/master/src/withForm.js) by [Brent Jackson](https://github.com/jxnblk), some naming conventions from Redux-Form, and (most recently) the render props approach popularized by [React-Motion](https://github.com/chenglou/react-motion) and [React-Router 4](https://github.com/ReactTraining/react-router). Whether you have used any of the above or not, Formik only takes a few minutes to get started with.

## Installation

Add Formik to your project.

```bash
npm i formik --save
```

You can also try before you buy with this **[demo of Formik on CodeSandbox.io](https://codesandbox.io/s/zKrK5YLDZ)**

## Demos

- [Basics](https://codesandbox.io/s/zKrK5YLDZ)
- [Sync Validation](https://codesandbox.io/s/q8yRqQMp)
- [Building your own input primitives](https://codesandbox.io/s/qJR4ykJk)
- [Working with 3rd-party inputs #1: react-select](https://codesandbox.io/s/jRzE53pqR)
- [Working with 3rd-party inputs #2: Draft.js](https://codesandbox.io/s/QW1rqjBLl)
- [Accessing React lifecycle functions](https://codesandbox.io/s/pgD4DLypy)

## Talks

- [An Introduction to Formik](https://youtu.be/-tDy7ds0dag?t=33s) by [Jared Palmer](https://twitter.com/jaredpalmer) @ Spotify NYC. August 15th, 2017.

## The gist

Formik keeps track of your form's state and then exposes it plus a few reusable methods and event handlers (`handleChange`, `handleBlur`, and `handleSubmit`) to your form via `props`. `handleChange` and `handleBlur` work exactly  as expected--they use a `name` or `id` attribute to figure out which field to update.

There are two ways to use Formik:

- `withFormik()`: A Higher-order Component (HoC) that accepts a configuration object
- `<Formik />`: A React component with a `render` prop

**Both do exactly the same thing** and share the same internal implementation. They just differ in their respective style....

```js
// Higher Order Component
import React from 'react'
import { withFormik } from 'formik'

// Our inner form component which receives our form's state and updater methods as props
const InnerForm = ({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) =>
  <form onSubmit={handleSubmit}>
    <input
      type="email"
      name="email"
      onChange={handleChange}
      value={values.email}
    />
    {touched.email && errors.email && <div>{errors.email}</div>}
    <input
      type="password"
      name="password"
      onChange={handleChange}
      value={values.password}
    />
    {touched.password && errors.password && <div>{errors.password}</div>}
    <button type="submit" disabled={isSubmitting}>Submit</button>
  </form>

// Wrap our form with the using withFormik HoC
const MyForm = withFormik({
  // Transform outer props into form values
  mapPropsToValues: props => ({ email: '', password: '' }),
  // Add a custom validation function (this can be async too!)
  validate: (values, props) => {
    let errors = {}
    if (!values.email) {
     errors.email = 'Required'
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
     errors.email = 'Invalid email address'
    }
    return errors
  },
  // Submission handler
  handleSubmit: (values, { props, setSubmitting, setErrors, /* setValues, setStatus, and other goodies */ }) => {
    LoginToMyApp(values)
      .then(
        user => {
          setSubmitting(false)
          // do whatevs...
          // props.updateUser(user)
        },
        errors => {
          setSubmitting(false)
          // Maybe even transform your API's errors into the same shape as Formik's!
          setErrors(transformMyApiErrors(errors))
        }
      )
  }
})(InnerForm)

// Use <MyForm /> anywhere
const Basic = () =>
  <div>
    <h1>My Form</h1>
    <p>This can be anywhere in your application</p>
    <MyForm />
  </div>

export default Basic
```

```js
// Render Prop
import React from 'react'
import { Formik } from 'formik'

const Basic = () =>
  <div>
    <h1>My Form</h1>
    <p>This can be anywhere in your application</p>
    {/*
      The benefit of the render prop approach is that you have full access to React's
      state, props, and composition model. Thus there is no need to map outer props
      to values...you can just set the initial values, and if they depend on props / state
      then--boom--you can directly access to props / state.

      The render prop accepts your inner form component, which you can define separately or inline
      totally up to you:
      - `<Formik render={props => <form>...</form>}>`
      - `<Formik component={InnerForm}>`
      - `<Formik>{props => <form>...</form>}</Formik>` (identical to as render, just written differently)
    */}
    <Formik
      initialValues={{
        email: '',
        password: ''
      }}
      validate={values => {
        // same as above, but feel free to move this into a class method now.
        let errors = {}
        if (!values.email) {
         errors.email = 'Required'
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
         errors.email = 'Invalid email address'
        }
        return errors
      }}
      onSubmit={(values, { setSubmitting,  setErrors, /* setValues and other goodies */ }) => {
        LoginToMyApp(values)
          .then(
            user => {
              setSubmitting(false)
              // do whatevs...
              // props.updateUser(user)
            },
            errors => {
              setSubmitting(false)
              // Maybe transform your API's errors into the same shape as Formik's
              setErrors(transformMyApiErrors(errors))
            }
          )
      }}
      render={({ values, errors, touched, handleChange, handleSubmit, isSubmitting }) =>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            value={values.email}
          />
          {touched.email && errors.email && <div>{errors.email}</div>}
          <input
            type="password"
            name="password"
            onChange={handleChange}
            value={values.password}
          />
          {touched.password && errors.password && <div>{errors.password}</div>}
          <button type="submit" disabled={isSubmitting}>Submit</button>
        </form>}
    />
  </div>

export default Basic
```

### Complementary Packages

As you can see above, validation is left up to you. Feel free to write your own validators or use a 3rd party library. Personally, I use [Yup](https://github.com/jquense/yup) for object schema validation. It has an API that's pretty similar [Joi](https://github.com/hapijs/joi) / [React PropTypes](https://github.com/facebook/prop-types) but is small enough for the browser and fast enough for runtime usage. Because I :heart: Yup sooo much, Formik has a special config option / prop for Yup called [`validationSchema`] which will automatically transform Yup's validation errors into a pretty object whose keys match [`values`] and [`touched`]. Anyways, you can install Yup from npm...

```
npm install yup --save
```


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Usage](#usage)
  - [Simple Example](#simple-example)
- [API](#api)
  - [`<Formik />`](#formik-)
    - [Formik render methods](#formik-render-methods)
    - [Formik props](#formik-props)
      - [`dirty: boolean`](#dirty-boolean)
      - [`errors: { [field: string]: string }`](#errors--field-string-string-)
      - [`handleBlur: (e: any) => void`](#handleblur-e-any--void)
      - [`handleChange: (e: React.ChangeEvent<any>) => void`](#handlechange-e-reactchangeeventany--void)
      - [`handleReset: () => void`](#handlereset---void)
      - [`handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`](#handlesubmit-e-reactformeventhtmlformevent--void)
      - [`isSubmitting: boolean`](#issubmitting-boolean)
      - [`isValid: boolean`](#isvalid-boolean)
      - [`resetForm: (nextValues?: Values) => void`](#resetform-nextvalues-values--void)
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
    - [`component`](#component)
    - [`render: (props: FormikProps<Values>) => ReactNode`](#render-props-formikpropsvalues--reactnode)
    - [`children: func`](#children-func)
    - [`onSubmit: (values: Values, formikBag: FormikBag) => void`](#onsubmit-values-values-formikbag-formikbag--void)
    - [`isInitialValid?: boolean`](#isinitialvalid-boolean)
    - [`initialValues?: Values`](#initialvalues-values)
    - [`validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`](#validate-values-values-props-props--formikerrorvalues--promiseany)
    - [`validateOnBlur?: boolean`](#validateonblur-boolean)
    - [`validateOnChange?: boolean`](#validateonchange-boolean)
    - [`validationSchema?: Schema | ((props: Props) => Schema)`](#validationschema-schema--props-props--schema)
  - [`<Field />`](#field-)
  - [`<Form />`](#form-)
  - [`withFormik(options)`](#withformikoptions)
    - [`options`](#options)
      - [`displayName?: string`](#displayname-string)
      - [`handleSubmit: (values: Values, formikBag: FormikBag) => void`](#handlesubmit-values-values-formikbag-formikbag--void)
        - [The "FormikBag":](#the-formikbag)
      - [`isInitialValid?: boolean | (props: Props) => boolean`](#isinitialvalid-boolean--props-props--boolean)
      - [`mapPropsToValues?: (props: Props) => Values`](#mappropstovalues-props-props--values)
      - [`validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`](#validate-values-values-props-props--formikerrorvalues--promiseany-1)
      - [`validateOnBlur?: boolean`](#validateonblur-boolean-1)
      - [`validateOnChange?: boolean`](#validateonchange-boolean-1)
      - [`validationSchema?: Schema | ((props: Props) => Schema)`](#validationschema-schema--props-props--schema-1)
    - [Injected props and methods](#injected-props-and-methods)
- [Guides](#guides)
  - [React Native](#react-native)
    - [Why use `setFieldValue` instead of `handleChange`?](#why-use-setfieldvalue-instead-of-handlechange)
    - [Avoiding a Render Callback](#avoiding-a-render-callback)
- [Organizations and projects using Formik](#organizations-and-projects-using-formik)
- [Authors](#authors)
- [Contributors](#contributors)

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

When we are done we want our dialog to accept just a `user`, `updateUser`, and `onClose` props.

```js
// User.js
import React from 'react';
import Dialog from 'MySuperDialog';
import EditUserForm from './EditUserForm';
import { Formik } from 'formik'

const EditUserDialog = ({ user, updateUser, onClose }) => {
  const { email, social } = user
  return (
    <Dialog onClose={onClose}>
      <h1>Edit User</h1>
      <Formik
        initialValues={{ email, ...social }}
        onSubmit={(values, actions) => {
          CallMyApi(user.id, values)
          .then(
            updatedUser => {
              actions.setSubmitting(false)
              updateUser(updatedUser),
              onClose()
            },
            error => {
              actions.setSubmitting(false)
              actions.setErrors(transformMyAPIErrorToAnObject(error));
            }
          )
        }}
        render={({ values, errors, touched, handleBlur, handleChange, handleSubmit, isSubmitting }) =>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              value={values.email}
            />
            {errors.email &&
              touched.email &&
              <div>
                {errors.email}
              </div>}
            <input
              type="text"
              name="facebook"
              onChange={handleChange}
              value={values.facebook}
            />
            {errors.facebook &&
              touched.facebook &&
              <div>
                {errors.facebook}
              </div>}
            <input
              type="text"
              name="twitter"
              onChange={handleChange}
              value={values.twitter}
            />
            {errors.twitter &&
              touched.twitter &&
              <div>
                {errors.twitter}
              </div>}          
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>}
      />
  </Dialog>
  )
}
```

To make writing forms less verbose. Formik comes with a few helpers to save you key strokes.

- `<Field>`
- `<Form/>`


This is the **exact** same form as before, but written with `<Form/>` and `<Field/>`:

```js
// EditUserDialog.js
import React from 'react';
import Dialog from 'MySuperDialog';
import EditUserForm from './EditUserForm';
import { Formik, Field, Form } from 'formik'

const EditUserDialog = ({ user, updateUser, onClose }) => {
  const { email, social } = user
  return (
    <Dialog onClose={onClose}>
      <h1>Edit User</h1>
      <Formik
        initialValues={{ email, ...social }}
        onSubmit={(values, actions) => {
          CallMyApi(user.id, values)
          .then(
            updatedUser => {
              actions.setSubmitting(false)
              updateUser(updatedUser),
              onClose()
            },
            error => {
              actions.setSubmitting(false)
              actions.setErrors(transformMyAPIErrorToAnObject(error));
            }
          )
        }}
        render={({ errors, touched, isSubmitting }) =>
          <Form>
            <Field type="email" name="email" />
            {errors.email &&
              touched.email &&
              <div>
                {errors.email}
              </div>}
            <Field type="text" name="facebook" />
            {errors.facebook &&
              touched.facebook &&
              <div>
                {errors.facebook}
              </div>}
            <Field type="text" name="twitter" />
            {errors.twitter &&
              touched.twitter &&
              <div>
                {errors.twitter}
              </div>}          
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>}
      />
  </Dialog>
  )
}
```

## API

### `<Formik />`

`<Formik>` is a component that helps you with building forms. In uses a render props pattern made popular by libraries like React Motion and React Router.

```js
import React from 'react'
import { Formik } from 'formik'

const BasicExample = () =>
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ name: 'jared' }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2))
          actions.setSubmitting(false)
        }, 1000);
      }}
      render={(props) =>
        <form onSubmit={props.handleSubmit}>
          <input
            type="text"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.name}
            name="name"
          />
          {props.errors.name &&
            <div id="feedback">
              {props.errors.name}
            </div>}
          <button type="submit">Submit</button>
        </form>}
    />
  </div>;
```

#### Formik render methods

There are three ways to render things with `<Formik/>`

- `<Formik component>`
- `<Formik render>`
- `<Formik children>`

#### Formik props

All three render methods will be passed the same props:

##### `dirty: boolean`

Returns `true` if any field has been touched by any means, `false` otherwise. `dirty` is a readonly computed property and should not be mutated directly.

##### `errors: { [field: string]: string }`

Form validation errors. Should match the shape of your form's [`values`] defined in `initialValues`. If you are using [`validationSchema`] (which you should be), keys and shape will match your schema exactly. Internally, Formik transforms raw [Yup validation errors](https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string) on your behalf. If you are using [`validate`], then that function will determine the `errors` objects shape.

##### `handleBlur: (e: any) => void`
`onBlur` event handler. Useful for when you need to track whether an input has been [`touched`] or not. This should be passed to `<input onBlur={handleBlur} ... />`

DOM-only. Use [`setFieldTouched`] in React Native.

##### `handleChange: (e: React.ChangeEvent<any>) => void`
General input change event handler. This will update the `values[key]` where `key` is the event-emitting input's `name` attribute. If the `name` attribute is not present, `handleChange` will look for an input's `id` attribute. Note: "input" here means all HTML inputs.

DOM-only. Use [`setFieldValue`] in React Native.

##### `handleReset: () => void`
Reset handler. Will reset the form to its initial state. This should be passed to `<button onClick={handleReset}>...</button>`

##### `handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`
Submit handler. This should be passed to `<form onSubmit={props.handleSubmit}>...</form>`

##### `isSubmitting: boolean`
Submitting state. Either `true` or `false`. Formik will set this to `true` on your behalf before calling [`handleSubmit`] to reduce boilerplate.

##### `isValid: boolean`

Returns `true` if the there are no [`errors`], or the result of [`isInitialValid`] the form if is in "pristine" condition (i.e. not [`dirty`])).

##### `resetForm: (nextValues?: Values) => void`
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


#### `component`

```tsx
<Formik component={ContactForm} />

const ContactForm = ({ handleSubmit, handleChange, handleBlur, values, errors }) => {
  return
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        name="name"
      />
      {errors.name &&
        <div>
          {errors.name}
        </div>}
      <button type="submit">Submit</button>
  </form>
}
```
**Warning:** `<Formik component>` takes precendence over `<Formik render>` so don’t use both in the same `<Formik>`.

#### `render: (props: FormikProps<Values>) => ReactNode`

```tsx
<Formik render={props => <ContactForm {...props} />}/>

<Formik
  render={({ handleSubmit, handleChange, handleBlur, values, errors }) => (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        name="name"
      />
      {errors.name &&
        <div>
          {errors.name}
        </div>}
      <button type="submit">Submit</button>
    </form>
  )}
/>
```

#### `children: func`

```tsx
<Formik children={props => <ContactForm {...props} />}/>

// or...

<Formik>
  {({ handleSubmit, handleChange, handleBlur, values, errors }) => (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={handleChange}
        onBlur={handleBlur}
        value={values.name}
        name="name"
      />
      {errors.name &&
        <div>
          {errors.name}
        </div>}
      <button type="submit">Submit</button>
    </form>
  )}
</Formik>
```



#### `onSubmit: (values: Values, formikBag: FormikBag) => void`
Your form submission handler. It is passed your forms [`values`] and the "FormikBag", which includes an object containing a subset of the [injected props and methods](/#injected-props-and-methods) (i.e. all the methods with names that start with `set<Thing>` + `resetForm`) and any props that were passed to the the wrapped component.

Note: [`errors`], [`touched`], [`status`] and all event handlers are NOT included in the `FormikBag`.

#### `isInitialValid?: boolean`

Default is `false`. Control the initial value of [`isValid`] prop prior to mount. You can also pass a function. Useful for situations when you want to enable/disable a submit and reset buttons on initial mount.

#### `initialValues?: Values`

If this option is specified, then Formik will transfer its results into updatable form state and make these values available to the new component as [`props.values`][`values`]. If `mapPropsToValues` is not specified, then Formik will map all props that are not functions to the inner component's [`props.values`][`values`]. That is, if you omit it, Formik will only pass `props` where `typeof props[k] !== 'function'`, where `k` is some key.

Even if your form is not receiving any props from its parent, use `mapPropsToValues` to initialize your forms empty state.

#### `validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`

_Note: I suggest using [`validationSchema`] and Yup for validation. However, `validate` is a dependency-free, straightforward way to validate your forms._

Validate the form's [`values`] with function. This function can either be:

1. Synchronous and return an [`errors`] object.

```js
// Synchronous validation
const validate = (values, props) => {
  let errors = {}

  if (!values.email) {
    errors.email = 'Required'
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address'
  }

  //...

  return errors
}
```
- Asynchronous and return a Promise that's error is an [`errors`] object

```js
// Async Validation
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

const validate = (values, props) => {
  return sleep(2000).then(() => {
    let errors = {}
    if (['admin', 'null', 'god']).includes(values.username) {
      errors.username = 'Nice try'
    }
    // ...
    if (Object.keys(errors).length) {
      throw errors
    }
  })
}
```

#### `validateOnBlur?: boolean`

Default is `true`. Use this option to run validations on `blur` events. More specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`] are called.

#### `validateOnChange?: boolean`

Default is `true`. Use this option to tell Formik to run validations on `change` events and `change`-related methods. More specifically, when either [`handleChange`], [`setFieldValue`], or [`setValues`] are called.

#### `validationSchema?: Schema | ((props: Props) => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup schema. This is used for validation. Errors are mapped by key to the inner component's [`errors`]. Its keys should match those of [`values`].

### `<Field />`

`<Field />` will automagically hook up inputs to Formik. It uses the `name` attribute to match up with Formik state. `<Field/>` will default to and `<input/>` element. To change the underlying element of `<Field/>`, specify a `component` prop. It can either be a string like `select` or another React component.

```js
import  React from 'react';
import { Formik, Field } from 'formik';

const Example = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ email: '', color: 'red', firstName: ''  }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2))
          actions.setSubmitting(false)
        }, 1000);
      }}
      render={(props: FormikProps<Values>) =>
        <form onSubmit={props.handleSubmit}>
          <Field type="email" name="email" placeholder="Email" />
          <Field component="select" name="color" >
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </Field>
          <Field component={CustomInputComponent} name="firstName" />
          <button type="submit">Submit</button>
        </form>}
    />
  </div>
);

const CustomInputComponent: React.SFC<FormikProps<Values> & CustomInputProps> => ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors } // also values, setXXXX, handleXXXX, isDirty, isValid, status, etc.
  ...props
}) => (
  <div>
    <input
      type="text"
      {...field}
      {...props}
    />
    {touched[name] && errors[name] && <div className="error">{errors[name]}</div>}
  </div>
)
```

### `<Form />`

Like `<Field/>`, `<Form/>` is a helper component you can use to save time. It is tiny wrapper around `<form onSubmit={context.formik.handleSubmit} />`. This means you don't need to explictly type out `<form onSubmit={props.handleSubmit}/>` if you don't want to.

**ReactDOM only**

```jsx
import React from 'react';
import { Formik, Field, Form } from 'formik';

const Example = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ email: '', color: 'red' }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2))
          actions.setSubmitting(false)
        }, 1000);
      }}
      component={MyForm}
    />
  </div>
);

const MyForm = () =>
  <Form>
    <Field type="email" name="email" placeholder="Email" />
    <Field component="select" name="color">
      <option value="red">Red</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
    </Field>
    <button type="submit">Submit</button>
  </Form>;
```

### `withFormik(options)`

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

Default is `true`. Use this option to tell Formik to run validations on `change` events and `change`-related methods. More specifically, when either [`handleChange`], [`setFieldValue`], or [`setValues`] are called.

##### `validationSchema?: Schema | ((props: Props) => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup schema. This is used for validation. Errors are mapped by key to the inner component's [`errors`]. Its keys should match those of [`values`].

#### Injected props and methods

These are identical to the props of `<Formik render={props => ...} />`

## Guides

### React Native

**Formik is 100% compatible with React Native and React Native Web.** However, because of differences between ReactDOM's and React Native's handling of forms and text input, there are two differences to be aware of. This section will walk you through them and what I consider to be best practices.

Before going any further, here's a super minimal gist of how to use Formik with React Native that demonstrates the key differences:

```js
// Formik x React Native example
import React from 'react';
import { Button, TextInput, View } from 'react-native';
import { withFormik } from 'formik';

const enhancer = withFormik(
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

export default enhancer(MyReactNativeForm);
```

As you can see above, the notable differences between using Formik with React DOM and React Native are:

1. Formik's `props.handleSubmit` is passed to a `<Button onPress={...}/>` instead of HTML `<form onSubmit={...}/>` component (since there is no `<form/>` element in React Native).
2. `<TextInput />` uses Formik's `props.setFieldValue` instead of `props.handleChange`. To understand why, see the discussion below.


#### Why use `setFieldValue` instead of `handleChange`?

'cuz [`handleChange`] will not work in React Native...

```js
import { Button, TextInput, View } from 'react-native';
import { Formik } from 'formik';

const MyReactNativeForm = props => (
  <View>
    <Formik
      onSubmit={(values, actions) => {
        setTimeout(() => {
          console.log(JSON.stringify(values, null, 2))
          actions.setSubmitting(false)
        }, 1000);
      }}
      render={props =>
        <View>
          <TextInput
            name="email"
            onChangeText={props.handleChange}   // this WILL NOT WORK IN RN
            value={props.values.email}
          />
          <Button onPress={props.handleSubmit} />
        </View>
      }
    />
  </View>
)
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

```js
// FormikReactNativeTextInput.js
import * as React from 'react'
import { TextInput } from 'react-native'

export default class FormikReactNativeTextInput extends React.Component {
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
// MyReactNativeForm.js
import { View, Button } from 'react-native'
import { FormikReactNativeTextInput as TextInput } from './FormikReactNativeTextInput'
import { Formik } from 'formik'


const MyReactNativeForm = props => (
  <View>
    <Formik
      onSubmit={(values, actions) => {
        setTimeout(() => {
          console.log(JSON.stringify(values, null, 2))
          actions.setSubmitting(false)
        }, 1000);
      }}
      render={props =>
        <View>
          <TextInput
            name="email"
            onChangeText={props.setFieldValue}
            value={props.values.email}
          />
          <Button onPress={props.handleSubmit} />
        </View>
      }
    />
  </View>
)

export default MyReactNativeForm
```

## Organizations and projects using Formik

[List of organizations and projects using Formik](https://github.com/jaredpalmer/formik/issues/87)

## Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)

## Contributors

Formik is made with <3 thanks to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars2.githubusercontent.com/u/4060187?v=4" width="100px;"/><br /><sub>Jared Palmer</sub>](http://jaredpalmer.com)<br />[💬](#question-jaredpalmer "Answering Questions") [💻](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Code") [🎨](#design-jaredpalmer "Design") [📖](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Documentation") [💡](#example-jaredpalmer "Examples") [🤔](#ideas-jaredpalmer "Ideas, Planning, & Feedback") [👀](#review-jaredpalmer "Reviewed Pull Requests") [⚠️](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Tests") | [<img src="https://avatars0.githubusercontent.com/u/109324?v=4" width="100px;"/><br /><sub>Ian White</sub>](https://www.stardog.io)<br />[💬](#question-eonwhite "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Aeonwhite "Bug reports") [💻](https://github.com/jaredpalmer/formik/commits?author=eonwhite "Code") [📖](https://github.com/jaredpalmer/formik/commits?author=eonwhite "Documentation") [🤔](#ideas-eonwhite "Ideas, Planning, & Feedback") [👀](#review-eonwhite "Reviewed Pull Requests") | [<img src="https://avatars0.githubusercontent.com/u/829963?v=4" width="100px;"/><br /><sub>Andrej Badin</sub>](http://andrejbadin.com)<br />[💬](#question-Andreyco "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3AAndreyco "Bug reports") [📖](https://github.com/jaredpalmer/formik/commits?author=Andreyco "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/91115?v=4" width="100px;"/><br /><sub>Adam Howard</sub>](http://adz.co.de)<br />[💬](#question-skattyadz "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Askattyadz "Bug reports") [🤔](#ideas-skattyadz "Ideas, Planning, & Feedback") [👀](#review-skattyadz "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/6711845?v=4" width="100px;"/><br /><sub>Vlad Shcherbin</sub>](https://github.com/VladShcherbin)<br />[💬](#question-VladShcherbin "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3AVladShcherbin "Bug reports") [🤔](#ideas-VladShcherbin "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/383212?v=4" width="100px;"/><br /><sub>Brikou CARRE</sub>](https://github.com/brikou)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Abrikou "Bug reports") [📖](https://github.com/jaredpalmer/formik/commits?author=brikou "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/5314713?v=4" width="100px;"/><br /><sub>Sam Kvale</sub>](http://skvale.github.io)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Askvale "Bug reports") [💻](https://github.com/jaredpalmer/formik/commits?author=skvale "Code") [⚠️](https://github.com/jaredpalmer/formik/commits?author=skvale "Tests") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars0.githubusercontent.com/u/13765558?v=4" width="100px;"/><br /><sub>Jon Tansey</sub>](http://jon.tansey.info)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Ajontansey "Bug reports") [💻](https://github.com/jaredpalmer/formik/commits?author=jontansey "Code") |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

---

MIT License.

---

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
