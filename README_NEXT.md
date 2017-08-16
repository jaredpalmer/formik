## Formik

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

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [`<Formik />`](#formik-)
  - [Formik Render Methods](#formik-render-methods)
    - [Formik props](#formik-props)
    - [`component`](#component)
    - [`render: (props: FormComponentProps<Values>) => ReactNode`](#render-props-formcomponentpropsvalues--reactnode)
    - [`children: func`](#children-func)
- [`<Field />`](#field-)
- [`<Form />`](#form-)
- [`FormikFactory(options)`](#formikfactoryoptions)
- [Authors](#authors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## `<Formik />`

Formik is now a component that uses render props!

API change from master: `mapValuesToProps` doesn't exist. Just pass an object to `getInitialValues` instead. 

Aside from that, `<Formik />` = `Formik()` except with a lot less ceremony...

```tsx
import { Formik } from 'formik/next'

interface Values {
  name: string
}
 
const BasicExample: React.SFC<...> = () => 
  <div>
    <h1>My Form</h1>
    <Formik
      getInitialValues={{ name: 'jared' }}
      handleSubmit={(values: Values) => {
        setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);
      }}
      render={(props: FormComponentProps<Values>) =>
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

You can avoid render callbacks all together too... #perf

```tsx
import { Formik } from 'formik/next'

interface Values {
  name: string
}

class BasicClassExample extends React.Component<any, any> {
  handleSubmit = (values: Values) => {
    setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);      
  }

  render() {
    return (
      <div>
        <h1>My Form</h1>
        <Formik
          getInitialValues={{ name: 'jared' }}
          handleSubmit={handleSubmit}
          component={ContactForm}
        />
      </div>
    );
  }
}

const ContactForm: React.SFC<FormComponentProps<Values>> = ({ 
  handleSubmit, 
  handleChange, 
  handleBlur, 
  values, 
  errors 
}) => {
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

### Formik Render Methods

There are now three ways to render things with Formik

- `<Formik component>`
- `<Formik render>`
- `<Formik children>`

#### Formik props

All three render methods will be passed the same three route props:

- dirty
- errors
- handleBlur
- handleChange
- handleReset
- handleSubmit
- isSubmitting
- isValid
- resetForm
- setErrors
- setFieldError
- setFieldTouched
- setFieldValue
- setStatus
- setSubmitting
- setTouched
- setValues
- status
- touched
- values

#### `component`

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

#### `render: (props: FormComponentProps<Values>) => ReactNode`

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

#### `children: func`

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

## `<Field />`

`<Field />` will automagically hook up inputs to Formik. It uses the `name` attribute to match up with Formik state. `<Field/>` will default to and `<input/>` element. To change the underlying element of `<Field/>`, specify a `component` prop. It can either be a string like `select` or another React component.

```tsx
import * as React from 'react';
import { Formik, Field,  FormComponentProps  } from 'formik/next';

interface Values {
  email: string;
  color: string;
  firstName: string;
}
 
const Example: React.SFC<...> = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      getInitialValues={{ email: '', color: 'red', firstName: ''  }}
      handleSubmit={(values: Values) => {
        setTimeout(() => alert(JSON.stringify(values, null, 2)), 1000);
      }}
      render={(props: FormComponentProps<Values>) =>
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

const CustomInputComponent: React.SFC<FormComponentProps<Values> & CustomInputProps> => ({
  name,
  placeholder,
  values,
  errors,
  handleBlur,
  handleChange,
  ...props
}) => (
  <div>
    <input 
      className="custom" 
      type="text"
      value={values[name]} 
      placeholder={placeholder}
      onChange={handleChange}
      onBlur={handlerBlur}
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
import { Formik, Field, Form, FormComponentProps  } from 'formik/next';

interface Values {
  email: string;
  color: string;
}
 
const FormExample: React.SFC<{}> = () => (
  <div>
    <h1>My Form</h1>
    <Formik
      getInitialValues={{ email: '', color: 'red' }}
      handleSubmit={(values: Values) => {
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

## `FormikFactory(options)`

**not implemented yet**

```tsx
import { Formik, InjectedFormikProps } from 'formik/next';

// backwards compatible API 

const withFormik = FormikFactory<InjectedFormikProps<Props, Values>>({ ... })

const Form = props => (
  <form onSubmit={props.handleSubmit}>
    {/* same as usual */}
  </form>
)

export default withFormik(Form)
```




## Authors

- Jared Palmer [@jaredpalmer](https://twitter.com/jaredpalmer)
- Ian White [@eonwhite](https://twitter.com/eonwhite)

MIT License. 
