![](https://user-images.githubusercontent.com/4060187/27243721-3b5219d0-52b1-11e7-96f1-dae8391a3ef6.png)

[![Build Status](https://travis-ci.org/jaredpalmer/formik.svg?branch=master)](https://travis-ci.org/jaredpalmer/formik)
[![Stable Release](https://img.shields.io/npm/v/formik.svg)](https://npm.im/formik)
[![Next Release](https://img.shields.io/npm/v/formik/next.svg)](https://www.npmjs.com/package/formik/v/next)
[![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://npm.im/formik)
[![gzip size](http://img.badgesize.io/https://unpkg.com/formik@latest/dist/formik.umd.production.js?compression=gzip)](https://unpkg.com/formik@latest/dist/formik.umd.production.js)
[![license](https://badgen.now.sh/badge/license/MIT)](./LICENSE)
[![Discord](https://img.shields.io/discord/102860784329052160.svg?style=flat-square)](https://discord.gg/cU6MCve)
[![Join the community on Spectrum](https://withspectrum.github.io/badge/badge.svg)](https://spectrum.chat/palmer)

## Overview

Let's face it, forms are really verbose in
[React](https://github.com/facebook/react). To make matters worse, most form
helpers do wayyyy too much magic and often have a significant performance cost
associated with them. Formik is a small library that helps you with the 3 most
annoying parts:

1.  Getting values in and out of form state
2.  Validation and error messages
3.  Handling form submission

By colocating all of the above in one place, Formik will keep things
organized--making testing, refactoring, and reasoning about your forms a breeze.

## Developer Experience

I ([@jaredpalmer](https://twitter.com/jaredpalmer)) wrote Formik while building a large internal administrative dashboard with
[@eonwhite](https://twitter.com/eonwhite). With around ~30 unique forms, it
quickly became obvious that we could benefit by standardizing not just our input
components but also the way in which data flowed through our forms.

### Why not Redux-Form?

By now, you might be thinking, "Why didn't you just use
[Redux-Form](https://github.com/erikras/redux-form)?" Good question.

1.  According to our prophet Dan Abramov,
    [**form state is inherently ephemeral and local**, so tracking it in Redux (or any kind of Flux library) is unnecessary](https://github.com/reactjs/redux/issues/1287#issuecomment-175351978)
2.  Redux-Form calls your entire top-level Redux reducer multiple times ON EVERY
    SINGLE KEYSTROKE. This is fine for small apps, but as your Redux app grows,
    input latency will continue to increase if you use Redux-Form.
3.  Redux-Form is 22.5 kB minified gzipped (Formik is 7.8 kB)

**My goal with Formik was to create a scalable, performant, form helper with a
minimal API that does the really really annoying stuff, and leaves the rest up
to you.**

## Testimonials

> "I can't believe people ever put forms in redux, or did anything else other than this."
> --[James Long](https://twitter.com/jlongster), Creator of Prettier and Actual Budget

> ["Formik. All day. All long."](https://twitter.com/ken_wheeler/status/974676242501947397?s=20)
> --[Ken Wheeler](https://twitter.com/ken_wheeler), Director of Open Source at Formidable Labs

> ["Been using @jaredpalmer's Formik lately at work – this is my all-time favorite way to handle forms"](https://twitter.com/jxnblk/status/1000036895366307846)
> --[Brent Jackson](https://twitter.com/jxnblk/), Creator of Rebass, styled-system, Compositor and many more

> ["Formik removes most of the moving parts involved in forms allowing me to move faster with more confidence."](https://twitter.com/tkh44/status/1000058583197732864)
> --[Kye Hohenberger](https://twitter.com/tkh44), Creator of Emotion

## Influences

Formik started by expanding on
[this little higher order component](https://github.com/jxnblk/rebass-recomposed/blob/master/src/withForm.js)
by [Brent Jackson](https://github.com/jxnblk), some naming conventions from
Redux-Form, and (most recently) the render props approach popularized by
[React-Motion](https://github.com/chenglou/react-motion) and
[React-Router 4](https://github.com/ReactTraining/react-router). Whether you
have used any of the above or not, Formik only takes a few minutes to get
started with.

## Installation

Add Formik to your project.

```bash
npm i formik --save
```

You can also try before you buy with this
**[demo of Formik on CodeSandbox.io](https://codesandbox.io/s/zKrK5YLDZ)** or on [Expo Snack](https://snack.expo.io/Bk9pPK87X)

## Demos

* [Basics](https://codesandbox.io/s/zKrK5YLDZ)
* [Sync Validation](https://codesandbox.io/s/q8yRqQMp)
* [Building your own input primitives](https://codesandbox.io/s/qJR4ykJk)
* [Working with 3rd-party inputs #1: react-select](https://codesandbox.io/s/jRzE53pqR)
* [Working with 3rd-party inputs #2: Draft.js](https://codesandbox.io/s/QW1rqjBLl)
* [Accessing React lifecycle functions](https://codesandbox.io/s/pgD4DLypy)
* [React Native](https://snack.expo.io/Bk9pPK87X)
* [TypeScript](https://codesandbox.io/s/8y578o8152)

## Talks

* [An Introduction to Formik](https://youtu.be/-tDy7ds0dag?t=33s) by
  [Jared Palmer](https://twitter.com/jaredpalmer) @ Spotify NYC. August 15th, 2017.

## Community Articles / Tutorials

* [Better React Forms with Formik](https://mead.io/formik/?utm_source=github&utm_campaign=formikrepo)
* [The Joy of Forms with React and Formik](https://keyholesoftware.com/2017/10/23/the-joy-of-forms-with-react-and-formik/)
* [Painless React Forms with Formik](https://hackernoon.com/painless-react-forms-with-formik-e61b70473c60)

## The gist

Formik keeps track of your form's state and then exposes it plus a few reusable
methods and event handlers (`handleChange`, `handleBlur`, and `handleSubmit`) to
your form via `props`. `handleChange` and `handleBlur` work exactly as
expected--they use a `name` or `id` attribute to figure out which field to
update.

There are two ways to use Formik:

* `withFormik()`: A Higher-order Component (HoC) that accepts a configuration
  object
* `<Formik />`: A React component with a `render` prop

**Both do exactly the same thing** and share the same internal implementation.
They just differ in their respective style....

```jsx
// Higher Order Component
import React from 'react';
import { withFormik } from 'formik';

// Our inner form component which receives our form's state and updater methods as props
const InnerForm = ({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
}) => (
  <form onSubmit={handleSubmit}>
    <input
      type="email"
      name="email"
      onChange={handleChange}
      onBlur={handleBlur}
      value={values.email}
    />
    {touched.email && errors.email && <div>{errors.email}</div>}
    <input
      type="password"
      name="password"
      onChange={handleChange}
      onBlur={handleBlur}
      value={values.password}
    />
    {touched.password && errors.password && <div>{errors.password}</div>}
    <button type="submit" disabled={isSubmitting}>
      Submit
    </button>
  </form>
);

// Wrap our form with the using withFormik HoC
const MyForm = withFormik({
  // Transform outer props into form values
  mapPropsToValues: props => ({ email: '', password: '' }),
  // Add a custom validation function (this can be async too!)
  validate: (values, props) => {
    const errors = {};
    if (!values.email) {
      errors.email = 'Required';
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
    ) {
      errors.email = 'Invalid email address';
    }
    return errors;
  },
  // Submission handler
  handleSubmit: (
    values,
    {
      props,
      setSubmitting,
      setErrors /* setValues, setStatus, and other goodies */,
    }
  ) => {
    LoginToMyApp(values).then(
      user => {
        setSubmitting(false);
        // do whatevs...
        // props.updateUser(user)
      },
      errors => {
        setSubmitting(false);
        // Maybe even transform your API's errors into the same shape as Formik's!
        setErrors(transformMyApiErrors(errors));
      }
    );
  },
})(InnerForm);

// Use <MyForm /> anywhere
const Basic = () => (
  <div>
    <h1>My Form</h1>
    <p>This can be anywhere in your application</p>
    <MyForm />
  </div>
);

export default Basic;
```

```jsx
// Render Prop
import React from 'react';
import { Formik } from 'formik';

const Basic = () => (
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
        password: '',
      }}
      validate={values => {
        // same as above, but feel free to move this into a class method now.
        let errors = {};
        if (!values.email) {
          errors.email = 'Required';
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)
        ) {
          errors.email = 'Invalid email address';
        }
        return errors;
      }}
      onSubmit={(
        values,
        { setSubmitting, setErrors /* setValues and other goodies */ }
      ) => {
        LoginToMyApp(values).then(
          user => {
            setSubmitting(false);
            // do whatevs...
            // props.updateUser(user)
          },
          errors => {
            setSubmitting(false);
            // Maybe transform your API's errors into the same shape as Formik's
            setErrors(transformMyApiErrors(errors));
          }
        );
      }}
      render={({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.email}
          />
          {touched.email && errors.email && <div>{errors.email}</div>}
          <input
            type="password"
            name="password"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values.password}
          />
          {touched.password && errors.password && <div>{errors.password}</div>}
          <button type="submit" disabled={isSubmitting}>
            Submit
          </button>
        </form>
      )}
    />
  </div>
);

export default Basic;
```

### Complementary Packages

As you can see above, validation is left up to you. Feel free to write your own
validators or use a 3rd party library. Personally, I use
[Yup](https://github.com/jquense/yup) for object schema validation. It has an
API that's pretty similar [Joi](https://github.com/hapijs/joi) /
[React PropTypes](https://github.com/facebook/prop-types) but is small enough
for the browser and fast enough for runtime usage. Because I :heart: Yup sooo
much, Formik has a special config option / prop for Yup called
[`validationSchema`] which will automatically transform Yup's validation errors
into a pretty object whose keys match [`values`] and [`touched`]. Anyways, you
can install Yup from npm...

```
npm install yup --save
```

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

* [Guides](#guides)
  * [Basics](#basics)
  * [React Native](#react-native)
    * [Avoiding new functions in render](#avoiding-new-functions-in-render)
  * [Using Formik with TypeScript](#using-formik-with-typescript)
    * [Render props (`<Formik />` and `<Field />`)](#render-props-formik--and-field-)
    * [`withFormik()`](#withformik)
  * [How Form Submission Works](#how-form-submission-works)
    * [Frequently Asked Questions](#frequently-asked-questions)
* [API](#api)
  * [`<Formik />`](#formik-)
    * [Formik render methods](#formik-render-methods)
    * [Formik props](#formik-props)
      * [`dirty: boolean`](#dirty-boolean)
      * [`errors: { [field: string]: string }`](#errors--field-string-string-)
      * [`handleBlur: (e: any) => void`](#handleblur-e-any--void)
      * [`handleChange: (e: React.ChangeEvent<any>) => void`](#handlechange-e-reactchangeeventany--void)
      * [`handleReset: () => void`](#handlereset---void)
      * [`handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`](#handlesubmit-e-reactformeventhtmlformevent--void)
      * [`isSubmitting: boolean`](#issubmitting-boolean)
      * [`isValid: boolean`](#isvalid-boolean)
      * [`isValidating: boolean`](#isvalidating-boolean)
      * [`resetForm: (nextValues?: Values) => void`](#resetform-nextvalues-values--void)
      * [`setErrors: (fields: { [field: string]: string }) => void`](#seterrors-fields--field-string-string---void)
      * [`setFieldError: (field: string, errorMsg: string) => void`](#setfielderror-field-string-errormsg-string--void)
      * [`setFieldTouched: (field: string, isTouched: boolean, shouldValidate?: boolean) => void`](#setfieldtouched-field-string-istouched-boolean-shouldvalidate-boolean--void)
      * [`submitForm: () => void`](#submitform---void)
      * [`submitCount: number`](#submitcount-number)
      * [`setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void`](#setfieldvalue-field-string-value-any-shouldvalidate-boolean--void)
      * [`setStatus: (status?: any) => void`](#setstatus-status-any--void)
      * [`setSubmitting: (isSubmitting: boolean) => void`](#setsubmitting-issubmitting-boolean--void)
      * [`setTouched: (fields: { [field: string]: boolean }) => void`](#settouched-fields--field-string-boolean---void)
      * [`setValues: (fields: { [field: string]: any }) => void`](#setvalues-fields--field-string-any---void)
      * [`status?: any`](#status-any)
      * [`touched: { [field: string]: boolean }`](#touched--field-string-boolean-)
      * [`values: { [field: string]: any }`](#values--field-string-any-)
      * [`validateForm: (values?: any) => void`](#validateform-values-any--void)
      * [`validateField: (field: string) => void`](#validatefield-field-string--void)
    * [`component`](#component)
    * [`render: (props: FormikProps<Values>) => ReactNode`](#render-props-formikpropsvalues--reactnode)
    * [`children: func`](#children-func)
    * [`enableReinitialize?: boolean`](#enablereinitialize-boolean)
    * [`isInitialValid?: boolean`](#isinitialvalid-boolean)
    * [`initialValues?: Values`](#initialvalues-values)
    * [`onReset?: (values: Values, formikBag: FormikBag) => void`](#onreset-values-values-formikbag-formikbag--void)
    * [`onSubmit: (values: Values, formikBag: FormikBag) => void`](#onsubmit-values-values-formikbag-formikbag--void)
    * [`validate?: (values: Values) => FormikErrors<Values> | Promise<any>`](#validate-values-values--formikerrorsvalues--promiseany)
    * [`validateOnBlur?: boolean`](#validateonblur-boolean)
    * [`validateOnChange?: boolean`](#validateonchange-boolean)
    * [`validationSchema?: Schema | (() => Schema)`](#validationschema-schema----schema)
  * [`<Field />`](#field-)
    * [`validate?: (value: any) => undefined | string | Promise<any>`](#validate-value-any--undefined--string--promiseany)
    * [Refs](#refs)
  * [`<FastField />`](#fastfield-)
    * [`<Field>` vs. `<FastField>` Example](#field-vs-fastfield-example)
  * [`<FieldArray />`](#fieldarray-)
    * [`name: string`](#name-string)
    * [`validateOnChange?: boolean`](#validateonchange-boolean-1)
    * [FieldArray Array of Objects](#fieldarray-array-of-objects)
    * [FieldArray Validation Gotchas](#fieldarray-validation-gotchas)
    * [FieldArray Helpers](#fieldarray-helpers)
    * [FieldArray render methods](#fieldarray-render-methods)
      * [`render: (arrayHelpers: ArrayHelpers) => React.ReactNode`](#render-arrayhelpers-arrayhelpers--reactreactnode)
      * [`component: React.ReactNode`](#component-reactreactnode)
  * [`<Form />`](#form-)
  * [`withFormik(options)`](#withformikoptions)
    * [`options`](#options)
      * [`displayName?: string`](#displayname-string)
      * [`enableReinitialize?: boolean`](#enablereinitialize-boolean-1)
      * [`handleSubmit: (values: Values, formikBag: FormikBag) => void`](#handlesubmit-values-values-formikbag-formikbag--void)
        * [The "FormikBag":](#the-formikbag)
      * [`isInitialValid?: boolean | (props: Props) => boolean`](#isinitialvalid-boolean--props-props--boolean)
      * [`mapPropsToValues?: (props: Props) => Values`](#mappropstovalues-props-props--values)
      * [`validate?: (values: Values, props: Props) => FormikErrors<Values> | Promise<any>`](#validate-values-values-props-props--formikerrorsvalues--promiseany)
      * [`validateOnBlur?: boolean`](#validateonblur-boolean-1)
      * [`validateOnChange?: boolean`](#validateonchange-boolean-2)
      * [`validationSchema?: Schema | ((props: Props) => Schema)`](#validationschema-schema--props-props--schema)
    * [Injected props and methods](#injected-props-and-methods)
  * [`connect()`](#connect)
* [Organizations and projects using Formik](#organizations-and-projects-using-formik)
* [Authors](#authors)
* [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Guides

### Basics

Imagine you want to build a form that lets you edit user data. However, your
user API has nested objects like so.

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

When we are done we want our dialog to accept just a `user`, `updateUser`, and
`onClose` props.

```jsx
// User.js
import React from 'react';
import Dialog from 'MySuperDialog';
import { Formik } from 'formik';

const EditUserDialog = ({ user, updateUser, onClose }) => {
  return (
    <Dialog onClose={onClose}>
      <h1>Edit User</h1>
      <Formik
        initialValues={user /** { email, social } */}
        onSubmit={(values, actions) => {
          CallMyApi(user.id, values).then(
            updatedUser => {
              actions.setSubmitting(false);
              updateUser(updatedUser), onClose();
            },
            error => {
              actions.setSubmitting(false);
              actions.setErrors(transformMyAPIErrorToAnObject(error));
            }
          );
        }}
        render={({
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
          isSubmitting,
        }) => (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
            />
            {errors.email && touched.email && <div>{errors.email}</div>}
            <input
              type="text"
              name="social.facebook"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.social.facebook}
            />
            {errors.social &&
              errors.social.facebook &&
              touched.facebook && <div>{errors.social.facebook}</div>}
            <input
              type="text"
              name="social.twitter"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.social.twitter}
            />
            {errors.social &&
              errors.social.twitter &&
              touched.twitter && <div>{errors.social.twitter}</div>}
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </form>
        )}
      />
    </Dialog>
  );
};
```

To make writing forms less verbose. Formik comes with a few helpers to save you
key strokes.

* `<Field>`
* `<Form />`

This is the **exact** same form as before, but written with `<Form />` and
`<Field />`:

```jsx
// EditUserDialog.js
import React from 'react';
import Dialog from 'MySuperDialog';
import { Formik, Field, Form } from 'formik';

const EditUserDialog = ({ user, updateUser, onClose }) => {
  return (
    <Dialog onClose={onClose}>
      <h1>Edit User</h1>
      <Formik
        initialValues={user /** { email, social } */}
        onSubmit={(values, actions) => {
          CallMyApi(user.id, values).then(
            updatedUser => {
              actions.setSubmitting(false);
              updateUser(updatedUser), onClose();
            },
            error => {
              actions.setSubmitting(false);
              actions.setErrors(transformMyAPIErrorToAnObject(error));
            }
          );
        }}
        render={({ errors, touched, isSubmitting }) => (
          <Form>
            <Field type="email" name="email" />
            {errors.email && touched.email && <div>{errors.email}</div>}
            <Field type="text" name="social.facebook" />
            {errors.social.facebook &&
              touched.social.facebook && <div>{errors.social.facebook}</div>}
            <Field type="text" name="social.twitter" />
            {errors.social.twitter &&
              touched.social.twitter && <div>{errors.social.twitter}</div>}
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      />
    </Dialog>
  );
};
```

### React Native

**Formik is 100% compatible with React Native and React Native Web.** However,
because of differences between ReactDOM's and React Native's handling of forms
and text input, there are two differences to be aware of. This section will walk
you through them and what I consider to be best practices.

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

#### Avoiding new functions in render

If for any reason you wish to avoid creating new functions on each render, I
suggest treating React Native's `<TextInput />` as if it were another 3rd party
custom input element:

* Write your own class wrapper around the custom input element
* Pass the custom component [`props.setFieldValue`][`setfieldvalue`] instead of
  [`props.handleChange`][`handlechange`]
* Use a custom change handler callback that calls whatever you passed-in
  `setFieldValue` as (in this case we'll match the React Native TextInput API
  and call it `this.props.onChangeText` for parity).

```jsx
// FormikReactNativeTextInput.js
import * as React from 'react';
import { TextInput } from 'react-native';

export default class FormikReactNativeTextInput extends React.Component {
  handleChange = (value: string) => {
    // remember that onChangeText will be Formik's setFieldValue
    this.props.onChangeText(this.props.name, value);
  };

  render() {
    // we want to pass through all the props except for onChangeText
    const { onChangeText, ...otherProps } = this.props;
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

```jsx
// MyReactNativeForm.js
import { View, Button } from 'react-native';
import TextInput from './FormikReactNativeTextInput';
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
          <TextInput
            name="email"
            onChangeText={props.setFieldValue}
            value={props.values.email}
          />
          <Button title="submit" onPress={props.handleSubmit} />
        </View>
      )}
    />
  </View>
);

export default MyReactNativeForm;
```

### Using Formik with TypeScript

[![TypeScript Types](https://img.shields.io/npm/types/formik.svg)](https://npm.im/formik)

The Formik source code is written in TypeScript, so you can rest assured that
types will always be up to date. As a mental model, Formik's types are very
similar to React Router 4's `<Route>`.

#### Render props (`<Formik />` and `<Field />`)

```tsx
import * as React from 'react';
import { Formik, FormikProps, Form, Field, FieldProps } from 'formik';

interface MyFormValues {
  firstName: string;
}

export const MyApp: React.SFC<{} /* whatever */> = () => {
  return (
    <div>
      <h1>My Example</h1>
      <Formik
        initialValues={{ firstName: '' }}
        onSubmit={(values: MyFormValues) => alert(JSON.stringify(values))}
        render={(formikBag: FormikProps<MyFormValues>) => (
          <Form>
            <Field
              name="firstName"
              render={({ field, form }: FieldProps<MyFormValues>) => (
                <div>
                  <input type="text" {...field} placeholder="First Name" />
                  {form.touched.firstName &&
                    form.errors.firstName &&
                    form.errors.firstName}
                </div>
              )}
            />
          </Form>
        )}
      />
    </div>
  );
};
```

#### `withFormik()`

```tsx
import React from 'react';
import * as Yup from 'yup';
import { withFormik, FormikProps, FormikErrors, Form, Field } from 'formik';

// Shape of form values
interface FormValues {
  email: string;
  password: string;
}

interface OtherProps {
  message: string;
}

// Aside: You may see InjectedFormikProps<OtherProps, FormValues> instead of what comes below in older code.. InjectedFormikProps was artifact of when Formik only exported a HoC. It is also less flexible as it MUST wrap all props (it passes them through).
const InnerForm = (props: OtherProps & FormikProps<FormValues>) => {
  const { touched, errors, isSubmitting, message } = props;
  return (
    <Form>
      <h1>{message}</h1>
      <Field type="email" name="email" />
      {touched.email && errors.email && <div>{errors.email}</div>}

      <Field type="password" name="password" />
      {touched.password && errors.password && <div>{errors.password}</div>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </Form>
  );
};

// The type of props MyForm receives
interface MyFormProps {
  initialEmail?: string;
  message: string; // if this passed all the way through you might do this or make a union type
}

// Wrap our form with the using withFormik HoC
const MyForm = withFormik<MyFormProps, FormValues>({
  // Transform outer props into form values
  mapPropsToValues: props => {
    return {
      email: props.initialEmail || '',
      password: '',
    };
  },

  // Add a custom validation function (this can be async too!)
  validate: (values: FormValues) => {
    let errors: FormikErrors = {};
    if (!values.email) {
      errors.email = 'Required';
    } else if (!isValidEmail(values.email)) {
      errors.email = 'Invalid email address';
    }
    return errors;
  },

  handleSubmit: values => {
    // do submitting things
  },
})(InnerForm);

// Use <MyForm /> anywhere
const Basic = () => (
  <div>
    <h1>My App</h1>
    <p>This can be anywhere in your application</p>
    <MyForm message="Sign up" />
  </div>
);

export default Basic;
```

### How Form Submission Works

To submit a form in Formik, you need to somehow fire off the provided `handleSubmit(e)` or `submitForm` prop. When you call either of these methods, Formik will execute the following _(pseudo code)_ each time:

* "Pre-submit"
  * Touch all fields
  * Set `isSubmitting` to `true`
  * Increment `submitCount` + 1
* "Validation"
  * Set `isValidating` to `true`
  * Run all field-level validations, `validate`, and `validationSchema` asynchronously and deeply merge results
  * Are there any errors?
    * Yes: Abort submission. Set `isValidating` to `false`, set `errors`, set `isSubmitting` to `false`
    * No: Set `isValidating` to `false`, proceed to "Submission"
* "Submission"
  * Proceed with running your submission handler (i.e.`onSubmit` or `handleSubmit`)
  * _you call `setSubmitting(false)`_ in your handler to finish the cycle

#### Frequently Asked Questions

<details>
<summary>How do I determine if my submission handler is executing?</summary>

If `isValidating` is `false` and `isSubmitting` is `true`.

</details>

<details>
<summary>Why does Formik touch all fields before submit?</summary>

It is common practice to only show an input's errors in the UI if it has been visited (a.k.a "touched"). Before submitting a form, Formik touches all fields so that all errors that may have been hidden will now be visible.

</details>

<details>
<summary>How do I protect against double submits?</summary>

Disable whatever is triggering submission if `isSubmitting` is `true`.

</details>
<details>
<summary>How do I know when my form is validating before submit?</summary>

If `isValidating` is `true` and `isSubmitting` is `true`.

</details>

## API

### `<Formik />`

`<Formik>` is a component that helps you with building forms. It uses a render
props pattern made popular by libraries like React Motion and React Router.

```jsx
import React from 'react';
import { Formik } from 'formik';

const BasicExample = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ name: 'jared' }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
      render={props => (
        <form onSubmit={props.handleSubmit}>
          <input
            type="text"
            onChange={props.handleChange}
            onBlur={props.handleBlur}
            value={props.values.name}
            name="name"
          />
          {props.errors.name && <div id="feedback">{props.errors.name}</div>}
          <button type="submit">Submit</button>
        </form>
      )}
    />
  </div>
);
```

#### Formik render methods

There are three ways to render things with `<Formik />`

* `<Formik component>`
* `<Formik render>`
* `<Formik children>`

#### Formik props

All three render methods will be passed the same props:

##### `dirty: boolean`

Returns `true` if values are not deeply equal from initial values, `false` otherwise.
`dirty` is a readonly computed property and should not be mutated directly.

##### `errors: { [field: string]: string }`

Form validation errors. Should match the shape of your form's [`values`] defined
in `initialValues`. If you are using [`validationSchema`] (which you should be),
keys and shape will match your schema exactly. Internally, Formik transforms raw
[Yup validation errors](https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string)
on your behalf. If you are using [`validate`], then that function will determine
the `errors` objects shape.

##### `handleBlur: (e: any) => void`

`onBlur` event handler. Useful for when you need to track whether an input has
been [`touched`] or not. This should be passed to `<input onBlur={handleBlur} ... />`

DOM-only. Use [`setFieldTouched`] in React Native.

##### `handleChange: (e: React.ChangeEvent<any>) => void`

General input change event handler. This will update the `values[key]` where
`key` is the event-emitting input's `name` attribute. If the `name` attribute is
not present, `handleChange` will look for an input's `id` attribute. Note:
"input" here means all HTML inputs.

DOM-only. Use [`setFieldValue`] in React Native.

##### `handleReset: () => void`

Reset handler. Will reset the form to its initial state. This should be passed
to `<button onClick={handleReset}>...</button>`

##### `handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`

Submit handler. This should be passed to `<form onSubmit={props.handleSubmit}>...</form>`. To learn more about the submission process, see [How Form Submission Works](#how-form-submission-works).

##### `isSubmitting: boolean`

Submitting state of the form. Returns `true` if submission is in progress and `false` otherwise. IMPORTANT: Formik will set this to `true` as soon as submission is _attempted_. To learn more about the submission process, see [How Form Submission Works](#how-form-submission-works).

##### `isValid: boolean`

Returns `true` if the there are no [`errors`], or the result of
[`isInitialValid`] the form if is in "pristine" condition (i.e. not [`dirty`])).

##### `isValidating: boolean`

Returns `true` if Formik is running any validation function, `false` otherwise. To learn more about what happens with `isValidating` during the submission process, see [How Form Submission Works](#how-form-submission-works).

##### `resetForm: (nextValues?: Values) => void`

Imperatively reset the form. This will clear [`errors`] and [`touched`], set
[`isSubmitting`] to `false`, `isValidating` to `false`, and rerun `mapPropsToValues` with the current
`WrappedComponent`'s `props` or what's passed as an argument. The latter is
useful for calling `resetForm` within `componentWillReceiveProps`.

##### `setErrors: (fields: { [field: string]: string }) => void`

Set `errors` imperatively.

##### `setFieldError: (field: string, errorMsg: string) => void`

Set the error message of a field imperatively. `field` should match the key of
[`errors`] you wish to update. Useful for creating custom input error handlers.

##### `setFieldTouched: (field: string, isTouched: boolean, shouldValidate?: boolean) => void`

Set the touched state of a field imperatively. `field` should match the key of
[`touched`] you wish to update. Useful for creating custom input blur handlers. Calling this method will trigger validation to run if [`validateOnBlur`] is set to `true` (which it is by default). You can also explicitly prevent/skip validation by passing a third argument as `false`.

##### `submitForm: () => void`

Trigger a form submission.

##### `submitCount: number`

Number of times user tried to submit the form. Increases when [`handleSubmit`](#handlesubmit-values-values-formikbag-formikbag--void) is called, resets after calling
[`handleReset`](#handlereset---void). `submitCount` is readonly computed property and should not be mutated directly.

##### `setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void`

Set the value of a field imperatively. `field` should match the key of
[`values`] you wish to update. Useful for creating custom input change handlers. Calling this will trigger validation to run if [`validateOnChange`] is set to `true` (which it is by default). You can also explicitly prevent/skip validation by passing a third argument as `false`.

##### `setStatus: (status?: any) => void`

Set a top-level [`status`] to anything you want imperatively. Useful for
controlling arbitrary top-level state related to your form. For example, you can
use it to pass API responses back into your component in [`handleSubmit`].

##### `setSubmitting: (isSubmitting: boolean) => void`

Set [`isSubmitting`] imperatively.

##### `setTouched: (fields: { [field: string]: boolean }) => void`

Set [`touched`] imperatively.

##### `setValues: (fields: { [field: string]: any }) => void`

Set [`values`] imperatively.

##### `status?: any`

A top-level status object that you can use to represent form state that can't
otherwise be expressed/stored with other methods. This is useful for capturing
and passing through API responses to your inner component.

`status` should only be modifed by calling
[`setStatus: (status?: any) => void`](#setstatus-status-any--void)

##### `touched: { [field: string]: boolean }`

Touched fields. Each key corresponds to a field that has been touched/visited.

##### `values: { [field: string]: any }`

Your form's values. Will have the shape of the result of [`mapPropsToValues`]
(if specified) or all props that are not functions passed to your wrapped
component.

##### `validateForm: (values?: any) => void`

Imperatively call your [`validate`] or [`validateSchema`] depending on what was specified. You can optionally pass values to validate against and this modify Formik state accordingly, otherwise this will use the current `values` of the form.

##### `validateField: (field: string) => void`

Imperatively call field's [`validate`] function if specified for given field. Formik will use the current field value.

#### `component`

```jsx
<Formik component={ContactForm} />;

const ContactForm = ({
  handleSubmit,
  handleChange,
  handleBlur,
  values,
  errors,
}) => (
  <form onSubmit={handleSubmit}>
    <input
      type="text"
      onChange={handleChange}
      onBlur={handleBlur}
      value={values.name}
      name="name"
    />
    {errors.name && <div>{errors.name}</div>}
    <button type="submit">Submit</button>
  </form>
};
```

**Warning:** `<Formik component>` takes precendence over `<Formik render>` so
don’t use both in the same `<Formik>`.

#### `render: (props: FormikProps<Values>) => ReactNode`

```jsx
<Formik render={props => <ContactForm {...props} />} />

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

```jsx
<Formik children={props => <ContactForm {...props} />} />

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

#### `enableReinitialize?: boolean`

Default is `false`. Control whether Formik should reset the form if
[`initialValues`] changes (using deep equality).

#### `isInitialValid?: boolean`

Default is `false`. Control the initial value of [`isValid`] prop prior to
mount. You can also pass a function. Useful for situations when you want to
enable/disable a submit and reset buttons on initial mount.

#### `initialValues?: Values`

Initial field values of the form, Formik will make these values available to
render methods component as [`props.values`][`values`].

Even if your form is empty by default, you must initialize all fields with
initial values otherwise React will throw an error saying that you have changed
an input from uncontrolled to controlled.

Note: `initialValues` not available to the higher-order component, use
[`mapPropsToValues`] instead.

#### `onReset?: (values: Values, formikBag: FormikBag) => void`

Your optional form reset handler. It is passed your forms [`values`] and the
"FormikBag".

#### `onSubmit: (values: Values, formikBag: FormikBag) => void`

Your form submission handler. It is passed your forms [`values`] and the
"FormikBag", which includes an object containing a subset of the
[injected props and methods](#injected-props-and-methods) (i.e. all the methods
with names that start with `set<Thing>` + `resetForm`) and any props that were
passed to the the wrapped component.

Note: [`errors`], [`touched`], [`status`] and all event handlers are NOT
included in the `FormikBag`.

#### `validate?: (values: Values) => FormikErrors<Values> | Promise<any>`

_Note: I suggest using [`validationSchema`] and Yup for validation. However,
`validate` is a dependency-free, straightforward way to validate your forms._

Validate the form's [`values`] with function. This function can either be:

1.  Synchronous and return an [`errors`] object.

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

* Asynchronous and return a Promise that's error in an [`errors`] object

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

#### `validateOnBlur?: boolean`

Default is `true`. Use this option to run validations on `blur` events. More
specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`]
are called.

#### `validateOnChange?: boolean`

Default is `true`. Use this option to tell Formik to run validations on `change`
events and `change`-related methods. More specifically, when either
[`handleChange`], [`setFieldValue`], or [`setValues`] are called.

#### `validationSchema?: Schema | (() => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup
schema. This is used for validation. Errors are mapped by key to the inner
component's [`errors`]. Its keys should match those of [`values`].

### `<Field />`

`<Field />` will automagically hook up inputs to Formik. It uses the `name`
attribute to match up with Formik state. `<Field />` will default to an
`<input />` element. To change the underlying element of `<Field />`, specify a
`component` prop. It can either be a string like `select` or another React
component. `<Field />` can also take a `render` prop.

```jsx
import React from 'react';
import { Formik, Field } from 'formik';

const Example = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      initialValues={{ email: '', color: 'red', firstName: '' }}
      onSubmit={(values, actions) => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
      render={(props: FormikProps<Values>) => (
        <form onSubmit={props.handleSubmit}>
          <Field type="email" name="email" placeholder="Email" />
          <Field component="select" name="color">
            <option value="red">Red</option>
            <option value="green">Green</option>
            <option value="blue">Blue</option>
          </Field>
          <Field name="firstName" component={CustomInputComponent} />
          <Field
            name="lastName"
            render={({ field /* _form */ }) => (
              <input {...field} placeholder="lastName" />
            )}
          />
          <button type="submit">Submit</button>
        </form>
      )}
    />
  </div>
);

const CustomInputComponent: React.SFC<
  FieldProps<Values> & CustomInputProps
> = ({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  ...props
}) => (
  <div>
    <input type="text" {...field} {...props} />
    {touched[field.name] &&
      errors[field.name] && <div className="error">{errors[field.name]}</div>}
  </div>
);
```

#### `validate?: (value: any) => undefined | string | Promise<any>`

You can run independent field-level validations by passing a function to the
`validate` prop. The function will respect the [`validateOnBlur`] and
[`validateOnChange`] config/props specified in the `<Field>'s` parent `<Formik>`
/ `withFormik`. This function can be either be:

* Synchronous and if invalid, return a `string` containing the error message or
  return `undefined`.

```js
// Synchronous validation for Field
const validate = value => {
  let errorMessage;
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
    errorMessage = 'Invalid email address';
  }
  return errorMessage;
};
```

* async: Return a Promise that throws a `string` containing the error message.
  This works like Formik's [`validate`], but instead of returning an [`errors`]
  object, it's just a `string`.

* Asynchronous and return a Promise that's error is an string with the error
  message

```js
// Async validation for Field
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const validate = value => {
  return sleep(2000).then(() => {
    if (['admin', 'null', 'god'].includes(value)) {
      throw 'Nice try';
    }
  });
};
```

Note: To allow for i18n libraries, the TypeScript typings for `validate` are
slightly relaxed and allow you to return a `Function` (e.g. `i18n('invalid')`).

#### Refs

When you are **not** using a custom component and you need to access the underlying DOM node created by `Field` (e.g. to call `focus`), pass the callback to the `innerRef` prop instead.

### `<FastField />`

`<FastField />` is an optimized version of `<Field />` meant to be used on large forms. `<FastField />` has the same exact API as `<Field>`, but implements `shouldComponentUpdate` internally to block all additional re-renders unless there are direct updates to the `<FastField>`'s relevant parts/slice of Formik state.

For example, `<FastField name="firstName" />` will only re-render when there are:

* Changes to `values.firstName`, `errors.firstName`, or `touched.firstName`. This is determined by shallow comparison. Note: dotpaths are supported.
* A prop is added/removed to the `<FastField name="firstName" />`
* The `name` prop changes

Other than for these aforementioned situations, `<FastField />` will not rerender. However, all updates triggered by a `<FastField>` will trigger re-renders to other "vanilla" `<Field>` components.

**When to use**

If a `<Field>` is "independent" of all other `<Field>`'s in your form, can use `<FastField>`. More specifically, if the `<Field />` does not change behavior/style/or render anything that is based on updates to another `<Field>` or `<FastField>`'s slice of Formik state AND it does not rely on other parts of top-level`<Formik>` state (e.g. `isSubmitting`, `isValidating`, `submitCount`), then you can use `<FastField>` as a drop-in replacement to `<Field />`.

#### `<Field>` vs. `<FastField>` Example

```js
import React from 'react';
import { Formik, Field, FastField, Form } from 'formik';

const Basic = () => (
  <div>
    <h1>Sign Up</h1>
    <Formik
      initialValues={{
        firstName: '',
        lastName: '',
        email: '',
      }}
      validationSchema={Yup.object().shape({
        firstName: Yup.string().required(),
        middleInitial: Yup.string(),
        lastName: Yup.string().required(),
        email: Yup.string()
          .email()
          .required(),
      })}
      onSubmit={values => {
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
        }, 500);
      }}
      render={formikProps => (
        <Form>
          {/** This <FastField> only updates for changes made to
           values.firstName, touched.firstName, errors.firstName */}
          <label htmlFor="firstName">First Name</label>
          <FastField name="firstName" placeholder="Weezy" />

          {/** Updates for all changes because it's from the
           top-level formikProps which get all updates */}
          {form.touched.firstName &&
            form.errors.firstName && <div>{form.errors.firstName}</div>}

          <label htmlFor="middleInitial">Middle Initial</label>
          <FastField
            name="middleInitial"
            placeholder="F"
            render={({ field, form }) => (
              <div>
                <input {...field} />
                {/**
                 * This updates normally because it's from the same slice of Formik state,
                 * i.e. path to the object matches the name of this <FastField />
                 */}
                {form.touched.middleInitial ? form.errors.middleInitial : null}

                {/** This won't ever update since it's coming from
                 from another <Field>/<FastField>'s (i.e. firstName's) slice   */}
                {form.touched.firstName && form.errors.firstName
                  ? form.errors.firstName
                  : null}

                {/* This doesn't update either */}
                {form.submitCount}

                {/* Imperative methods still work as expected */}
                <button
                  type="button"
                  onClick={form.setFieldValue('middleInitial', 'J')}
                >
                  J
                </button>
              </div>
            )}
          />

          {/** Updates for all changes to Formik state
           and all changes by all <Field>s and <FastField>s */}
          <label htmlFor="lastName">LastName</label>
          <Field
            name="lastName"
            placeholder="Baby"
            render={({ field, form }) => (
              <div>
                <input {...field} />
                {/** Works because this is inside
                 of a <Field/>, which gets all updates */}
                {form.touched.firstName && form.errors.firstName
                  ? form.errors.firstName
                  : null}
              </div>
            )}
          />

          {/** Updates for all changes to Formik state and
           all changes by all <Field>s and <FastField>s */}
          <label htmlFor="email">Email</label>
          <Field name="email" placeholder="jane@acme.com" type="email" />

          <button type="submit">Submit</button>
        </Form>
      )}
    />
  </div>
);
```

### `<FieldArray />`

`<FieldArray />` is a component that helps with common array/list manipulations. You pass it a `name` property with the path to the key within `values` that holds the relevant array. `<FieldArray />` will then give you access to array helper methods via render props. For convenience, calling these methods will trigger validation and also manage `touched` for you.

```jsx
import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik';

// Here is an example of a form with an editable list.
// Next to each input are buttons for insert and remove.
// If the list is empty, there is a button to add an item.
export const FriendList = () => (
  <div>
    <h1>Friend List</h1>
    <Formik
      initialValues={{ friends: ['jared', 'ian', 'brent'] }}
      onSubmit={values =>
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
        }, 500)
      }
      render={({ values }) => (
        <Form>
          <FieldArray
            name="friends"
            render={arrayHelpers => (
              <div>
                {values.friends && values.friends.length > 0 ? (
                  values.friends.map((friend, index) => (
                    <div key={index}>
                      <Field name={`friends.${index}`} />
                      <button
                        type="button"
                        onClick={() => arrayHelpers.remove(index)} // remove a friend from the list
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => arrayHelpers.insert(index, '')} // insert an empty string at a position
                      >
                        +
                      </button>
                    </div>
                  ))
                ) : (
                  <button type="button" onClick={() => arrayHelpers.push('')}>
                    {/* show this when user has removed all friends from the list */}
                    Add a friend
                  </button>
                )}
                <div>
                  <button type="submit">Submit</button>
                </div>
              </div>
            )}
          />
        </Form>
      )}
    />
  </div>
);
```

##### `name: string`

The name or path to the relevant key in [`values`].

##### `validateOnChange?: boolean`

Default is `true`. Determines if form validation should or should not be run _after_ any array manipulations.

#### FieldArray Array of Objects

You can also iterate through an array of objects, by following a convention of `object[index]property` or `object.index.property` for the name attributes of `<Field />` or `<input />` elements in `<FieldArray />`.

```jsx
<Form>
  <FieldArray
    name="friends"
    render={arrayHelpers => (
      <div>
        {values.friends.map((friend, index) => (
          <div key={index}>
            <Field name={`friends[${index}]name`} />
            <Field name={`friends.${index}.age`} /> // both these conventions do
            the same
            <button type="button" onClick={() => arrayHelpers.remove(index)}>
              -
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => arrayHelpers.push({ name: '', age: '' })}
        >
          +
        </button>
      </div>
    )}
  />
</Form>
```

#### FieldArray Validation Gotchas

Validation can be tricky with `<FieldArray>`.

If you use [`validationSchema`] and your form has array validation requirements (like a min length) as well as nested array field requirements, displaying errors can be tricky. Formik/Yup will show validation errors inside out. For example,

```js
const schema = Yup.object().shape({
  friends: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .min(4, 'too short')
          .required('Required'), // these constraints take precedence
        salary: Yup.string()
          .min(3, 'cmon')
          .required('Required'), // these constraints take precedence
      })
    )
    .required('Must have friends') // these constraints are shown if and only if inner constraints are satisfied
    .min(3, 'Minimum of 3 friends'),
});
```

Since Yup and your custom validation function should always output error messages as strings, you'll need to sniff whether your nested error is an array or a string when you go to display it.

So...to display `'Must have friends'` and `'Minimum of 3 friends'` (our example's array validation contstraints)...

**_Bad_**

```js
// within a `FieldArray`'s render
const FriendArrayErrors = errors =>
  errors.friends ? <div>{errors.friends}</div> : null; // app will crash
```

**_Good_**

```js
// within a `FieldArray`'s render
const FriendArrayErrors = errors =>
  typeof errors.friends === 'string' ? <div>{errors.friends}</div> : null;
```

For the nested field errors, you should assume that no part of the object is defined unless you've checked for it. Thus, you may want to do yourself a favor and make a custom `<ErrorMessage />` component that looks like this:

```jsx
import { Field, getIn } from 'formik';

const ErrorMessage = ({ name }) => (
  <Field
    name={name}
    render={({ form }) => {
      const error = getIn(form.errors, name);
      const touch = getIn(form.touched, name);
      return touch && error ? error : null;
    }}
  />
);

// Usage
<ErrorMessage name="friends[0].name" />; // => null, 'too short', or 'required'
```

_NOTE_: In Formik v0.12 / 1.0, a new `meta` prop may be added to `Field` and `FieldArray` that will give you relevant metadata such as `error` & `touch`, which will save you from having to use Formik or lodash's getIn or checking if the path is defined on your own.

#### FieldArray Helpers

The following methods are made available via render props.

* `push: (obj: any) => void`: Add a value to the end of an array
* `swap: (indexA: number, indexB: number) => void`: Swap two values in an array
* `move: (from: number, to: number) => void`: Move an element in an array to another index
* `insert: (index: number, value: any) => void`: Insert an element at a given index into the array
* `unshift: (value: any) => number`: Add an element to the beginning of an array and return its length
* `remove<T>(index: number): T | undefined`: Remove an element at an index of an array and return it
* `pop<T>(): T | undefined`: Remove and return value from the end of the array

#### FieldArray render methods

There are three ways to render things with `<FieldArray />`

* `<FieldArray name="..." component>`
* `<FieldArray name="..." render>`

##### `render: (arrayHelpers: ArrayHelpers) => React.ReactNode`

```jsx
import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik'

export const FriendList = () => (
  <div>
    <h1>Friend List</h1>
    <Formik
      initialValues={{ friends: ['jared', 'ian', 'brent'] }}
      onSubmit={...}
      render={formikProps => (
        <FieldArray
          name="friends"
          render={({ move, swap, push, insert, unshift, pop }) => (
            <Form>
              {/*... use these however you want */}
            </Form>
          )}
        />
    />
  </div>
);
```

##### `component: React.ReactNode`

```jsx
import React from 'react';
import { Formik, Form, Field, FieldArray } from 'formik'


export const FriendList = () => (
  <div>
    <h1>Friend List</h1>
    <Formik
      initialValues={{ friends: ['jared', 'ian', 'brent'] }}
      onSubmit={...}
      render={formikProps => (
        <FieldArray
          name="friends"
          component={MyDynamicForm}
        />
    />
  </div>
);


// In addition to the array helpers, Formik state and helpers
// (values, touched, setXXX, etc) are provided through a `form`
// prop
export const MyDynamicForm = ({
  move, swap, push, insert, unshift, pop, form
}) => (
 <Form>
  {/**  whatever you need to do */}
 </Form>
);
```

### `<Form />`

Like `<Field />`, `<Form />` is a helper component you can use to save time. It is
tiny wrapper around `<form onSubmit={context.formik.handleSubmit} />`. This
means you don't need to explictly type out `<form onSubmit={props.handleSubmit} />` if you don't want to.

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
          alert(JSON.stringify(values, null, 2));
          actions.setSubmitting(false);
        }, 1000);
      }}
      component={MyForm}
    />
  </div>
);

const MyForm = () => (
  <Form>
    <Field type="email" name="email" placeholder="Email" />
    <Field component="select" name="color">
      <option value="red">Red</option>
      <option value="green">Green</option>
      <option value="blue">Blue</option>
    </Field>
    <button type="submit">Submit</button>
  </Form>
);
```

### `withFormik(options)`

Create a higher-order React component class that passes props and form handlers
(the "`FormikBag`") into your component derived from supplied options.

#### `options`

##### `displayName?: string`

When your inner form component is a stateless functional component, you can use
the `displayName` option to give the component a proper name so you can more
easily find it in
[React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en).
If specified, your wrapped form will show up as `Formik(displayName)`. If
omitted, it will show up as `Formik(Component)`. This option is not required for
class components (e.g. `class XXXXX extends React.Component {..}`).

##### `enableReinitialize?: boolean`

Default is `false`. Control whether Formik should reset the form if the wrapped
component props change (using deep equality).

##### `handleSubmit: (values: Values, formikBag: FormikBag) => void`

Your form submission handler. It is passed your forms [`values`] and the
"FormikBag", which includes an object containing a subset of the
[injected props and methods](#injected-props-and-methods) (i.e. all the methods
with names that start with `set<Thing>` + `resetForm`) and any props that were
passed to the the wrapped component.

###### The "FormikBag":

* `props` (props passed to the wrapped component)
* [`resetForm`]
* [`setErrors`]
* [`setFieldError`]
* [`setFieldTouched`]
* [`setFieldValue`]
* [`setStatus`]
* [`setSubmitting`]
* [`setTouched`]
* [`setValues`]

Note: [`errors`], [`touched`], [`status`] and all event handlers are NOT
included in the `FormikBag`.

##### `isInitialValid?: boolean | (props: Props) => boolean`

Default is `false`. Control the initial value of [`isValid`] prop prior to
mount. You can also pass a function. Useful for situations when you want to
enable/disable a submit and reset buttons on initial mount.

##### `mapPropsToValues?: (props: Props) => Values`

If this option is specified, then Formik will transfer its results into
updatable form state and make these values available to the new component as
[`props.values`][`values`]. If `mapPropsToValues` is not specified, then Formik
will map all props that are not functions to the inner component's
[`props.values`][`values`]. That is, if you omit it, Formik will only pass
`props` where `typeof props[k] !== 'function'`, where `k` is some key.

Even if your form is not receiving any props from its parent, use
`mapPropsToValues` to initialize your forms empty state.

##### `validate?: (values: Values, props: Props) => FormikErrors<Values> | Promise<any>`

_Note: I suggest using [`validationSchema`] and Yup for validation. However,
`validate` is a dependency-free, straightforward way to validate your forms._

Validate the form's [`values`] with function. This function can either be:

1.  Synchronous and return an [`errors`] object.

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

* Asynchronous and return a Promise that's error is an [`errors`] object

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

Default is `true`. Use this option to run validations on `blur` events. More
specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`]
are called.

##### `validateOnChange?: boolean`

Default is `true`. Use this option to tell Formik to run validations on `change`
events and `change`-related methods. More specifically, when either
[`handleChange`], [`setFieldValue`], or [`setValues`] are called.

##### `validationSchema?: Schema | ((props: Props) => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup
schema. This is used for validation. Errors are mapped by key to the inner
component's [`errors`]. Its keys should match those of [`values`].

#### Injected props and methods

These are identical to the props of `<Formik render={props => ...} />`

### `connect()`

`connect()` is a higher-order component that injects raw Formik context as prop called `formik` into the inner component. Fun fact: Formik uses `connect()` under the hood to wire up `<Field/>`, `<FastField>`, and `<Form>`. Advanced users may find it useful to use `connect()` when building custom components.

```js
import { connect } from 'formik';

const SubmitCount = ({ formik }) => <div>{formik.submitCount}</div>;

export default connect(SubmitCount);
```

## Organizations and projects using Formik

[List of organizations and projects using Formik](https://github.com/jaredpalmer/formik/issues/87)

## Authors

* Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
* Ian White [@eonwhite](https://twitter.com/eonwhite)

## Contributors

Formik is made with <3 thanks to these wonderful people
([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars2.githubusercontent.com/u/4060187?v=4" width="100px;"/><br /><sub><b>Jared Palmer</b></sub>](http://jaredpalmer.com)<br />[💬](#question-jaredpalmer "Answering Questions") [💻](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Code") [🎨](#design-jaredpalmer "Design") [📖](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Documentation") [💡](#example-jaredpalmer "Examples") [🤔](#ideas-jaredpalmer "Ideas, Planning, & Feedback") [👀](#review-jaredpalmer "Reviewed Pull Requests") [⚠️](https://github.com/jaredpalmer/formik/commits?author=jaredpalmer "Tests") | [<img src="https://avatars0.githubusercontent.com/u/109324?v=4" width="100px;"/><br /><sub><b>Ian White</b></sub>](https://www.stardog.io)<br />[💬](#question-eonwhite "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Aeonwhite "Bug reports") [💻](https://github.com/jaredpalmer/formik/commits?author=eonwhite "Code") [📖](https://github.com/jaredpalmer/formik/commits?author=eonwhite "Documentation") [🤔](#ideas-eonwhite "Ideas, Planning, & Feedback") [👀](#review-eonwhite "Reviewed Pull Requests") | [<img src="https://avatars0.githubusercontent.com/u/829963?v=4" width="100px;"/><br /><sub><b>Andrej Badin</b></sub>](http://andrejbadin.com)<br />[💬](#question-Andreyco "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3AAndreyco "Bug reports") [📖](https://github.com/jaredpalmer/formik/commits?author=Andreyco "Documentation") | [<img src="https://avatars2.githubusercontent.com/u/91115?v=4" width="100px;"/><br /><sub><b>Adam Howard</b></sub>](http://adz.co.de)<br />[💬](#question-skattyadz "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Askattyadz "Bug reports") [🤔](#ideas-skattyadz "Ideas, Planning, & Feedback") [👀](#review-skattyadz "Reviewed Pull Requests") | [<img src="https://avatars1.githubusercontent.com/u/6711845?v=4" width="100px;"/><br /><sub><b>Vlad Shcherbin</b></sub>](https://github.com/VladShcherbin)<br />[💬](#question-VladShcherbin "Answering Questions") [🐛](https://github.com/jaredpalmer/formik/issues?q=author%3AVladShcherbin "Bug reports") [🤔](#ideas-VladShcherbin "Ideas, Planning, & Feedback") | [<img src="https://avatars3.githubusercontent.com/u/383212?v=4" width="100px;"/><br /><sub><b>Brikou CARRE</b></sub>](https://github.com/brikou)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Abrikou "Bug reports") [📖](https://github.com/jaredpalmer/formik/commits?author=brikou "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/5314713?v=4" width="100px;"/><br /><sub><b>Sam Kvale</b></sub>](http://skvale.github.io)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Askvale "Bug reports") [💻](https://github.com/jaredpalmer/formik/commits?author=skvale "Code") [⚠️](https://github.com/jaredpalmer/formik/commits?author=skvale "Tests") |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| [<img src="https://avatars0.githubusercontent.com/u/13765558?v=4" width="100px;"/><br /><sub><b>Jon Tansey</b></sub>](http://jon.tansey.info)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Ajontansey "Bug reports") [💻](https://github.com/jaredpalmer/formik/commits?author=jontansey "Code") | [<img src="https://avatars0.githubusercontent.com/u/6819171?v=4" width="100px;"/><br /><sub><b>Tyler Martinez</b></sub>](http://slightlytyler.com)<br />[🐛](https://github.com/jaredpalmer/formik/issues?q=author%3Aslightlytyler "Bug reports") [📖](https://github.com/jaredpalmer/formik/commits?author=slightlytyler "Documentation") |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the
[all-contributors](https://github.com/kentcdodds/all-contributors)
specification. Contributions of any kind welcome!

---

MIT License.

---

[`displayname`]: #displayname-string
[`handlesubmit`]: #handlesubmit-payload-formikbag--void
[`formikbag`]: #the-formikbag
[`isinitialvalid`]: #isinitialvalid-boolean--props-props--boolean
[`mappropstovalues`]: #mappropstovalues-props--props
[`validate`]: #validate-values-values-props-props--formikerrorvalues--promiseany
[`validateonblur`]: #validateonblur-boolean
[`validateonchange`]: #validateonchange-boolean
[`validationschema`]: #validationschema-schema--props-props--schema
[injected props and methods]: #injected-props-and-methods
[`dirty`]: #dirty-boolean
[`errors`]: #errors--field-string-string-
[`handleblur`]: #handleblur-e-any--void
[`handlechange`]: #handlechange-e-reactchangeeventany--void
[`handlereset`]: #handlereset---void
[`handlesubmit`]: #handlesubmit-e-reactformeventhtmlformevent--void
[`issubmitting`]: #issubmitting-boolean
[`isvalid`]: #isvalid-boolean
[`resetform`]: #resetform-nextprops-props--void
[`seterrors`]: #seterrors-fields--field-string-string---void
[`setfielderror`]: #setfielderror-field-string-errormsg-string--void
[`setfieldtouched`]: #setfieldtouched-field-string-istouched-boolean-shouldvalidate-boolean--void
[`setfieldvalue`]: #setfieldvalue-field-string-value-any-shouldvalidate-boolean--void
[`setstatus`]: #setstatus-status-any--void
[`setsubmitting`]: #setsubmitting-boolean--void
[`settouched`]: #settouched-fields--field-string-boolean---void
[`setvalues`]: #setvalues-fields--field-string-any---void
[`status`]: #status-any
[`touched`]: #touched--field-string-boolean-
[`values`]: #values--field-string-any-
