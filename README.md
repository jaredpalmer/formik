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
npm i formik@next yup --save
```
Note: Yup is 100% optional. You are free to [write your own validators][`validate`].

You can also try before you buy with this **[demo of Formik on CodeSandbox.io](https://codesandbox.io/s/zKrK5YLDZ)**

## Quick start

```js
import React from 'react'
import { Formik } from 'formik'
import Yup from 'yup'

const Basic = () => 
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{
        email: ''
      }}
      validationSchema={Yup.object().shape({
         email: Yup.string().email('Invalid email').required('Required!')
      })}
      onSubmit={(values) => {
        setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);
      }}
      render={({ values, touched, errors, handleChange, handleBlur, handleSubmit }) =>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
            name="email"
          />
          {touched.email &&
            errors.email &&
            <div id="feedback">
              {errors.email}
            </div>}
          <button type="submit">Submit</button>
        </form>}
    />
  </div>

export default Basic
```

To make writing forms less verbose. Formik comes with a few helpers to save you key strokes.

- `<Field>` 
- `<Form/>`


This is the **exact** same form as before, but written with `<Form/>` and `<Field/>`:

```js
import React from 'react'
import { Formik, Field, Form } from 'formik'
import Yup from 'yup'

const Basic = () => 
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{
        email: ''
      }}
      validationSchema={Yup.object().shape({
         email: Yup.string().email('Invalid email').required('Required!')
      })}
      onSubmit={(values) => {
        setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);
      }}
      render={({ touched, errors }) =>
        <Form>
          <Field name="email" type="email" />
          {touched.email &&
            errors.email &&
            <div id="feedback">
              {errors.email}
            </div>}
          <button type="submit">Submit</button>
        </Form>}
    />
  </div>

export default Basic
```



<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**API Reference**

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
  - [`component`](#component)
  - [`render: (props: FormikProps<Values>) => ReactNode`](#render-props-formikpropsvalues--reactnode)
  - [`children: func`](#children-func)
  - [`handleSubmit: (values: Values, formikBag: FormikBag) => void`](#handlesubmit-values-values-formikbag-formikbag--void)
  - [`isInitialValid?: boolean`](#isinitialvalid-boolean)
  - [`getInitialValues?: Values`](#getinitialvalues-values)
  - [`validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`](#validate-values-values-props-props--formikerrorvalues--promiseany)
  - [`validateOnBlur?: boolean`](#validateonblur-boolean)
  - [`validateOnChange?: boolean`](#validateonchange-boolean)
  - [`validationSchema?: Schema | ((props: Props) => Schema)`](#validationschema-schema--props-props--schema)
- [`<Field />`](#field-)
- [`<Form />`](#form-)
- [`withFormik(options)`](#withformikoptions)
  - [`options`](#options)
      - [`displayName?: string`](#displayname-string)
      - [`handleSubmit: (values: Values, formikBag: FormikBag) => void`](#handlesubmit-values-values-formikbag-formikbag--void-1)
        - [The "FormikBag":](#the-formikbag)
      - [`isInitialValid?: boolean | (props: Props) => boolean`](#isinitialvalid-boolean--props-props--boolean)
      - [`mapPropsToValues?: (props: Props) => Values`](#mappropstovalues-props-props--values)
      - [`validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`](#validate-values-values-props-props--formikerrorvalues--promiseany-1)
      - [`validateOnBlur?: boolean`](#validateonblur-boolean-1)
      - [`validateOnChange?: boolean`](#validateonchange-boolean-1)
      - [`validationSchema?: Schema | ((props: Props) => Schema)`](#validationschema-schema--props-props--schema-1)
- [Organizations and projects using Formik](#organizations-and-projects-using-formik)
- [Authors](#authors)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## `<Formik />`

Formik is now a component that uses render props!

API change from master: `mapValuesToProps` doesn't exist. Just pass an object to `getInitialValues` instead. 

Aside from that, `<Formik />` = `Formik()` except with a lot less ceremony...

```tsx
import { Formik } from 'formik'

interface Values {
  name: string
}
 
const BasicExample: React.SFC<...> = () => 
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ name: 'jared' }}
      onSubmit={(values: Values) => {
        setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);
      }}
      render={(props: FormikProps<Values>) =>
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

### Formik render methods

There are now three ways to render things with Formik

- `<Formik component>`
- `<Formik render>`
- `<Formik children>`

### Formik props

All three render methods will be passed the same props:

#### `dirty: boolean`

Returns `true` if any field has been touched by any means, `false` otherwise. `dirty` is a readonly computed property and should not be mutated directly.

#### `errors: { [field: string]: string }`

Form validation errors. Should match the shape of your form's [`values`] defined in Formik options. If you are using [`validationSchema`] (which you should be), keys and shape will match your schema exactly. Internally, Formik transforms raw [Yup validation errors](https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string) on your behalf. If you are using [`validate`], then that function will determine the `errors` objects shape. 

#### `handleBlur: (e: any) => void`
`onBlur` event handler. Useful for when you need to track whether an input has been [`touched`] or not. This should be passed to `<input onBlur={handleBlur} ... />`

DOM-only. Use [`setFieldTouched`] in React Native.

#### `handleChange: (e: React.ChangeEvent<any>) => void`
General input change event handler. This will update the `values[key]` where `key` is the event-emitting input's `name` attribute. If the `name` attribute is not present, `handleChange` will look for an input's `id` attribute. Note: "input" here means all HTML inputs.

DOM-only. Use [`setFieldValue`] in React Native. 

#### `handleReset: () => void`
Reset handler. Will reset the form to its initial state. This should be passed to `<button onClick={handleReset}>...</button>`

#### `handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`
Submit handler. This should be passed to `<form onSubmit={handleSubmit}>...</form>`

#### `isSubmitting: boolean`
Submitting state. Either `true` or `false`. Formik will set this to `true` on your behalf before calling [`handleSubmit`] to reduce boilerplate.

#### `isValid: boolean` 

Returns `true` if the there are no [`errors`], or the result of [`isInitialValid`] the form if is in "pristine" condition (i.e. not [`dirty`])).

#### `resetForm: (nextProps?: Props) => void`
Imperatively reset the form. This will clear [`errors`] and [`touched`], set [`isSubmitting`] to `false` and rerun `mapPropsToValues` with the current `WrappedComponent`'s `props` or what's passed as an argument. That latter is useful for calling `resetForm` within `componentWillReceiveProps`.

#### `setErrors: (fields: { [field: string]: string }) => void`
Set `errors` imperatively.

#### `setFieldError: (field: string, errorMsg: string) => void`
Set the error message of a field imperatively. `field` should match the key of [`errors`] you wish to update.  Useful for creating custom input error handlers.

#### `setFieldTouched: (field: string, isTouched: boolean) => void`
Set the touched state of a field imperatively. `field` should match the key of [`touched`] you wish to update.  Useful for creating custom input blur handlers.

#### `setFieldValue: (field: string, value: any) => void`
Set the value of a field imperatively. `field` should match the key of [`values`] you wish to update.  Useful for creating custom input change handlers.

#### `setStatus: (status?: any) => void`
Set a top-level [`status`] to anything you want imperatively. Useful for controlling arbitrary top-level state related to your form. For example, you can use it to pass API responses back into your component in [`handleSubmit`].

#### `setSubmitting: (boolean) => void`
Set [`isSubmitting`] imperatively.

#### `setTouched: (fields: { [field: string]: boolean }) => void`
Set [`touched`] imperatively.

#### `setValues: (fields: { [field: string]: any }) => void`
Set [`values`] imperatively.

#### `status?: any`
A top-level status object that you can use to represent form state that can't otherwised be expressed/stored with other methods. This is useful for capturing and passing through API responses to your inner component. 

`status` should only be modifed by calling [`setStatus: (status?: any) => void`](#setstatus-status-any--void)

#### `touched: { [field: string]: boolean }`
Touched fields. Each key corresponds to a field that has been touched/visited.

#### `values: { [field: string]: any }`
Your form's values. Will have the shape of the result of [`mapPropsToValues`] (if specified) or all props that are not functions passed to your wrapped component.


### `component`

```tsx
<Formik component={ContactForm} />

const ContactForm = ({ handleSubmit, handleChange, handleBlur, values, errors }) => {
  return
    <form onSubmit={props.handleSubmit}>
      <input
        type="text"
        onChange={props.handleChange}
        onBlur={props.handleBlur}
        value={props.values.name}
        name="name"
      />
      {props.errors.name &&
        <div>
          {props.errors.name}
        </div>}
      <button type="submit">Submit</button>
  </form>
}
```
**Warning:** `<Formik component>` takes precendence over `<Formik render>` so don’t use both in the same `<Formik>`.

### `render: (props: FormikProps<Values>) => ReactNode`

```tsx
<Formik render={props => <ContactForm {...props} />}/>

<Formik 
  render={({ handleSubmit, handleChange, handleBlur, values, errors }) => ( 
    <form onSubmit={props.handleSubmit}>
      <input
        type="text"
        onChange={props.handleChange}
        onBlur={props.handleBlur}
        value={props.values.name}
        name="name"
      />
      {props.errors.name &&
        <div>
          {props.errors.name}
        </div>}
      <button type="submit">Submit</button>
    </form>
  )} 
/>
```

### `children: func`

```tsx
<Formik children={props => <ContactForm {...props} />}/>

// or...

<Formik>
  {({ handleSubmit, handleChange, handleBlur, values, errors }) => ( 
    <form onSubmit={props.handleSubmit}>
      <input
        type="text"
        onChange={props.handleChange}
        onBlur={props.handleBlur}
        value={props.values.name}
        name="name"
      />
      {props.errors.name &&
        <div>
          {props.errors.name}
        </div>}
      <button type="submit">Submit</button>
    </form>
  )} 
</Formik>
```



### `onSubmit: (values: Values, formikBag: FormikBag) => void`
Your form submission handler. It is passed your forms [`values`] and the "FormikBag", which includes an object containing a subset of the [injected props and methods](/#injected-props-and-methods) (i.e. all the methods with names that start with `set<Thing>` + `resetForm`) and any props that were passed to the the wrapped component.

Note: [`errors`], [`touched`], [`status`] and all event handlers are NOT included in the `FormikBag`.

### `isInitialValid?: boolean`

Default is `false`. Control the initial value of [`isValid`] prop prior to mount. You can also pass a function. Useful for situations when you want to enable/disable a submit and reset buttons on initial mount.

### `initialValues?: Values`

If this option is specified, then Formik will transfer its results into updatable form state and make these values available to the new component as [`props.values`][`values`]. If `mapPropsToValues` is not specified, then Formik will map all props that are not functions to the inner component's [`props.values`][`values`]. That is, if you omit it, Formik will only pass `props` where `typeof props[k] !== 'function'`, where `k` is some key. 

Even if your form is not receiving any props from its parent, use `mapPropsToValues` to initialize your forms empty state.

### `validate?: (values: Values, props: Props) => FormikError<Values> | Promise<any>`

_Note: I suggest using [`validatationSchema`] and Yup for validation. However, `validate` is a dependency-free, straightforward way to validate your forms._

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

### `validateOnBlur?: boolean`

Default is `true`. Use this option to run validations on `blur` events. More specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`] are called.

### `validateOnChange?: boolean`

Default is `false`. Use this option to tell Formik to run validations on `change` events and `change`-related methods. More specifically, when either [`handleChange`], [`setFieldValue`], or [`setValues`] are called.

### `validationSchema?: Schema | ((props: Props) => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup schema. This is used for validation. Errors are mapped by key to the inner component's [`errors`]. Its keys should match those of [`values`]. 

## `<Field />`

`<Field />` will automagically hook up inputs to Formik. It uses the `name` attribute to match up with Formik state. `<Field/>` will default to and `<input/>` element. To change the underlying element of `<Field/>`, specify a `component` prop. It can either be a string like `select` or another React component.

```tsx
import * as React from 'react';
import { Formik, Field,  FormikProps  } from 'formik';

interface Values {
  email: string;
  color: string;
  firstName: string;
}
 
const Example: React.SFC<...> = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ email: '', color: 'red', firstName: ''  }}
      onSubmit={(values: Values) => {
        setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);
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

## `<Form />`

Like `<Field/>`, `<Form/>` is a helper component you can use to save time. It is tiny wrapper around `<form onSubmit={context.formik.handleSubmit} />`. this means you don't need to explictly type out `<form onSubmit={props.handleSubmit}/>` if you don't want to.

**ReactDOM only**

```jsx
import * as React from 'react';
import { Formik, Field, Form, FormikProps  } from 'formik';

interface Values {
  email: string;
  color: string;
}
 
const FormExample: React.SFC<{}> = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ email: '', color: 'red' }}
      onSubmit={(values: Values) => {
        setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);
      }}
      component={MyForm}
    />
  </div>
);

const MyForm: React.SFC<{}> = () => 
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

## `withFormik(options)`

If you're not into render props, Formik also exports a higher-order component `withFormik()`. It works a lot like Redux's `connect` or Apollo's `graphql`. You simply wrap your inner form component with an enhancer...

```tsx
import { withFormik, InjectedFormikProps } from 'formik';

// backwards compatible API 

const enhancer = withFormik<InjectedFormikProps<Props, Values>>({ 
  displayName: 'MyForm', // useful for React DevTools
  mapPropsToValues: (props) => ({  }), // transform outer props to values
  handleSubmit: (values, formikBag /* { props, setSubmitting, setErrors, SetStatus, etc. } */ ) => {
     CallMyApi(values)
      .then(
        () => {
          formikBag.setSubmitting(false)
          // do stuff 
        },
        error => {
         formikBag.setSubmitting(false)
         // do stuff 
        }
      )
  }
  // other config options are identical to <Formik />'s props
})

const Form = props => (
  <form onSubmit={props.handleSubmit}>
    {/* same as usual */}
  </form>
)

export default enhancer(Form)
```

### `options`

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

##### `validateOnBlur?: boolean`

Default is `true`. Use this option to run validations on `blur` events. More specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`] are called.

##### `validateOnChange?: boolean`

Default is `false`. Use this option to tell Formik to run validations on `change` events and `change`-related methods. More specifically, when either [`handleChange`], [`setFieldValue`], or [`setValues`] are called.

##### `validationSchema?: Schema | ((props: Props) => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup schema. This is used for validation. Errors are mapped by key to the inner component's [`errors`]. Its keys should match those of [`values`]. 

## Organizations and projects using Formik

[List of organizations and projects using Formik](https://github.com/jaredpalmer/formik/issues/87)

## Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)

## Contributors

Formik is made with <3 thanks to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars2.githubusercontent.com/u/4060187?v=4" width="100px;"/><br /><sub>Jared Palmer</sub>](http://jaredpalmer.com)<br />[💬](#question-jaredpalmer "Answering Questions") [💻](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Code") [🎨](#design-jaredpalmer "Design") [📖](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Documentation") [💡](#example-jaredpalmer "Examples") [🤔](#ideas-jaredpalmer "Ideas, Planning, & Feedback") [👀](#review-jaredpalmer "Reviewed Pull Requests") [⚠️](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Tests") | [<img src="https://avatars0.githubusercontent.com/u/109324?v=4" width="100px;"/><br /><sub>Ian White</sub>](https://www.stardog.io)<br />[💬](#question-eonwhite "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Aeonwhite "Bug reports") [💻](https://github.com/jaredpalmer/formik/commits?author=eonwhite "Code") [📖](https://github.com/jaredpalmer/formik/commits?author=eonwhite "Documentation") [🤔](#ideas-eonwhite "Ideas, Planning, & Feedback") [👀](#review-eonwhite "Reviewed Pull Requests") | [<img src="https://avatars0.githubusercontent.com/u/829963?v=4" width="100px;"/><br /><sub>Andrej Badin</sub>](http://andrejbadin.com)<br />[💬](#question-Andreyco "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3AAndreyco "Bug reports") [📖](https://github.com/jaredpalmer/formik/commits?author=Andreyco "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/91115?v=4" width="100px;"/><br /><sub>Adam Howard</sub>](http://adz.co.de)<br />[💬](#question-skattyadz "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Askattyadz "Bug reports") [🤔](#ideas-skattyadz "Ideas, Planning, & Feedback") [👀](#review-skattyadz "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/6711845?v=4" width="100px;"/><br /><sub>Vlad Shcherbin</sub>](https://github.com/VladShcherbin)<br />[💬](#question-VladShcherbin "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3AVladShcherbin "Bug reports") [🤔](#ideas-VladShcherbin "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/383212?v=4" width="100px;"/><br /><sub>Brikou CARRE</sub>](https://github.com/brikou)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Abrikou "Bug reports") [📖](https://github.com/jaredpalmer/formik/commits?author=brikou "Documentation") |
| :---: | :---: | :---: | :---: | :---: | :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!


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
