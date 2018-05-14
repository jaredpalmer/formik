---
path: "/docs/api"
date: "2015-07-01T22:12:03.284Z"
title: "API Reference"
description: "Formik API Reference documentation"
back: "/docs"
---

# API Reference

## `<Formik />`

`<Formik>` is a component that helps you with building forms. It uses a render
props pattern made popular by libraries like React Motion and React Router.

```js
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

### Formik render methods

There are three ways to render things with `<Formik />`

* `<Formik component>`
* `<Formik render>`
* `<Formik children>`

### Formik props

All three render methods will be passed the same props:

#### `dirty: boolean`

Returns `true` if values are not deeply equal from initial values, `false` otherwise.
`dirty` is a readonly computed property and should not be mutated directly.

#### `errors: { [field: string]: string }`

Form validation errors. Should match the shape of your form's [`values`] defined
in `initialValues`. If you are using [`validationSchema`] (which you should be),
keys and shape will match your schema exactly. Internally, Formik transforms raw
[Yup validation errors](https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string)
on your behalf. If you are using [`validate`], then that function will determine
the `errors` objects shape.

#### `handleBlur: (e: any) => void`

`onBlur` event handler. Useful for when you need to track whether an input has
been [`touched`] or not. This should be passed to `<input onBlur={handleBlur} ... />`

DOM-only. Use [`setFieldTouched`] in React Native.

#### `handleChange: (e: React.ChangeEvent<any>) => void`

General input change event handler. This will update the `values[key]` where
`key` is the event-emitting input's `name` attribute. If the `name` attribute is
not present, `handleChange` will look for an input's `id` attribute. Note:
"input" here means all HTML inputs.

DOM-only. Use [`setFieldValue`] in React Native.

#### `handleReset: () => void`

Reset handler. Will reset the form to its initial state. This should be passed
to `<button onClick={handleReset}>...</button>`

#### `handleSubmit: (e: React.FormEvent<HTMLFormEvent>) => void`

Submit handler. This should be passed to `<form onSubmit={props.handleSubmit}>...</form>`

#### `isSubmitting: boolean`

Submitting state. Either `true` or `false`. Formik will set this to `true` on
your behalf before calling [`handleSubmit`] to reduce boilerplate.

#### `isValid: boolean`

Returns `true` if the there are no [`errors`], or the result of
[`isInitialValid`] the form if is in "pristine" condition (i.e. not [`dirty`])).

#### `resetForm: (nextValues?: Values) => void`

Imperatively reset the form. This will clear [`errors`] and [`touched`], set
[`isSubmitting`] to `false` and rerun `mapPropsToValues` with the current
`WrappedComponent`'s `props` or what's passed as an argument. The latter is
useful for calling `resetForm` within `componentWillReceiveProps`.

#### `setErrors: (fields: { [field: string]: string }) => void`

Set `errors` imperatively.

#### `setFieldError: (field: string, errorMsg: string) => void`

Set the error message of a field imperatively. `field` should match the key of
[`errors`] you wish to update. Useful for creating custom input error handlers.

#### `setFieldTouched: (field: string, isTouched: boolean, shouldValidate?: boolean) => void`

Set the touched state of a field imperatively. `field` should match the key of
[`touched`] you wish to update. Useful for creating custom input blur handlers. Calling this method will trigger validation to run if [`validateOnBlur`] is set to `true` (which it is by default). You can also explicitly prevent/skip validation by passing a third argument as `false`.

#### `submitForm: () => void`

Trigger a form submission.

#### `submitCount: number`

Number of times user tried to submit the form. Increases when [`handleSubmit`](#handlesubmit-values-values-formikbag-formikbag--void) is called, resets after calling  
[`handleReset`](#handlereset---void). `submitCount` is readonly computed property and should not be mutated directly.

#### `setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void`

Set the value of a field imperatively. `field` should match the key of
[`values`] you wish to update. Useful for creating custom input change handlers. Calling this will trigger validation to run if [`validateOnChange`] is set to `true` (which it is by default). You can also explicitly prevent/skip validation by passing a third argument as `false`.

#### `setStatus: (status?: any) => void`

Set a top-level [`status`] to anything you want imperatively. Useful for
controlling arbitrary top-level state related to your form. For example, you can
use it to pass API responses back into your component in [`handleSubmit`].

#### `setSubmitting: (isSubmitting: boolean) => void`

Set [`isSubmitting`] imperatively.

#### `setTouched: (fields: { [field: string]: boolean }) => void`

Set [`touched`] imperatively.

#### `setValues: (fields: { [field: string]: any }) => void`

Set [`values`] imperatively.

#### `status?: any`

A top-level status object that you can use to represent form state that can't
otherwise be expressed/stored with other methods. This is useful for capturing
and passing through API responses to your inner component.

`status` should only be modifed by calling
[`setStatus: (status?: any) => void`](#setstatus-status-any--void)

#### `touched: { [field: string]: boolean }`

Touched fields. Each key corresponds to a field that has been touched/visited.

#### `values: { [field: string]: any }`

Your form's values. Will have the shape of the result of [`mapPropsToValues`]
(if specified) or all props that are not functions passed to your wrapped
component.

#### `validateForm: (values?: any) => void`

Imperatively call your [`validate`] or [`validateSchema`] depending on what was specified. You can optionally pass values to validate against and this modify Formik state accordingly, otherwise this will use the current `values` of the form.

### `component`

```tsx
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

### `render: (props: FormikProps<Values>) => ReactNode`

```tsx
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

### `children: func`

```tsx
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

### `enableReinitialize?: boolean`

Default is `false`. Control whether Formik should reset the form if
[`initialValues`] changes (using deep equality).

### `isInitialValid?: boolean`

Default is `false`. Control the initial value of [`isValid`] prop prior to
mount. You can also pass a function. Useful for situations when you want to
enable/disable a submit and reset buttons on initial mount.

### `initialValues?: Values`

Initial field values of the form, Formik will make these values available to
render methods component as [`props.values`][`values`].

Even if your form is empty by default, you must initialize all fields with
initial values otherwise React will throw an error saying that you have changed
an input from uncontrolled to controlled.

Note: `initialValues` not available to the higher-order component, use
[`mapPropsToValues`] instead.

### `onReset?: (values: Values, formikBag: FormikBag) => void`

Your optional form reset handler. It is passed your forms [`values`] and the
"FormikBag".

### `onSubmit: (values: Values, formikBag: FormikBag) => void`

Your form submission handler. It is passed your forms [`values`] and the
"FormikBag", which includes an object containing a subset of the
[injected props and methods](#injected-props-and-methods) (i.e. all the methods
with names that start with `set<Thing>` + `resetForm`) and any props that were
passed to the the wrapped component.

Note: [`errors`], [`touched`], [`status`] and all event handlers are NOT
included in the `FormikBag`.

### `validate?: (values: Values) => FormikErrors<Values> | Promise<any>`

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

Default is `true`. Use this option to run validations on `blur` events. More
specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`]
are called.

### `validateOnChange?: boolean`

Default is `true`. Use this option to tell Formik to run validations on `change`
events and `change`-related methods. More specifically, when either
[`handleChange`], [`setFieldValue`], or [`setValues`] are called.

### `validationSchema?: Schema | (() => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup
schema. This is used for validation. Errors are mapped by key to the inner
component's [`errors`]. Its keys should match those of [`values`].

## `<Field />`

`<Field />` will automagically hook up inputs to Formik. It uses the `name`
attribute to match up with Formik state. `<Field />` will default to an
`<input />` element. To change the underlying element of `<Field />`, specify a
`component` prop. It can either be a string like `select` or another React
component. `<Field />` can also take a `render` prop.

```js
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
              <input {...field} placeholder="firstName" />
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

### `validate?: (value: any) => undefined | string | Promise<any>`

You can run independent field-level validations by passing a function to the
`validate>` prop. The function will respect the [`validateOnBlur`] and
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

## `<FieldArray />`

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
        <FieldArray
          name="friends"
          render={arrayHelpers => (
            <Form>
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
            </Form>
          )}
        />
      )}
    />
  </div>
);
```

#### `name: string`

The name or path to the relevant key in [`values`].

#### `validateOnChange?: boolean`

Default is `true`. Determines if form validation should or should not be run _after_ any array manipulations.

### FieldArray Validation Gotchas

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
  typeof friends === 'string' ? <div>{errors.friends}</div> : null;
```

For the nested field errors, you should assume that no part of the object is defined unless you've checked for it. Thus, you may want to do yourself a favor and make a custom `<ErrorMessage />` component that looks like this:

```js
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

_NOTE_: In Formik v0.12 / 1.0, a new `meta` prop may be be added to `Field` and `FieldArray` that will give you relevant metadata such as `error` & `touch`, which will save you from having to use Formik or lodash's getIn or checking if the path is defined on your own.

### FieldArray Helpers

The following methods are made available via render props.

* `push: (obj: any) => void`: Add a value to the end of an array
* `swap: (indexA: number, indexB: number) => void`: Swap two values in an array
* `move: (from: number, to: number) => void`: Move an element in an array to another index
* `insert: (index: number, value: any) => void`: Insert an element at a given index into the array
* `unshift: (value: any) => number`: Add an element to the beginning of an array and return its length
* `remove<T>(index: number): T | undefined`: Remove an element at an index of an array and return it
* `pop<T>(): T | undefined`: Remove and return value from the end of the array

### FieldArray render methods

There are three ways to render things with `<FieldArray />`

* `<FieldArray name="..." component>`
* `<FieldArray name="..." render>`

#### `render: (arrayHelpers: ArrayHelpers) => React.ReactNode`

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

#### `component: React.ReactNode`

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

## `<Form />`

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

## `withFormik(options)`

Create a higher-order React component class that passes props and form handlers
(the "`FormikBag`") into your component derived from supplied options.

### `options`

#### `displayName?: string`

When your inner form component is a stateless functional component, you can use
the `displayName` option to give the component a proper name so you can more
easily find it in
[React DevTools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi?hl=en).
If specified, your wrapped form will show up as `Formik(displayName)`. If
omitted, it will show up as `Formik(Component)`. This option is not required for
class components (e.g. `class XXXXX extends React.Component {..}`).

#### `enableReinitialize?: boolean`

Default is `false`. Control whether Formik should reset the form if the wrapped
component props change (using deep equality).

#### `handleSubmit: (values: Values, formikBag: FormikBag) => void`

Your form submission handler. It is passed your forms [`values`] and the
"FormikBag", which includes an object containing a subset of the
[injected props and methods](#injected-props-and-methods) (i.e. all the methods
with names that start with `set<Thing>` + `resetForm`) and any props that were
passed to the the wrapped component.

#### The "FormikBag":

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

#### `isInitialValid?: boolean | (props: Props) => boolean`

Default is `false`. Control the initial value of [`isValid`] prop prior to
mount. You can also pass a function. Useful for situations when you want to
enable/disable a submit and reset buttons on initial mount.

#### `mapPropsToValues?: (props: Props) => Values`

If this option is specified, then Formik will transfer its results into
updatable form state and make these values available to the new component as
[`props.values`][`values`]. If `mapPropsToValues` is not specified, then Formik
will map all props that are not functions to the inner component's
[`props.values`][`values`]. That is, if you omit it, Formik will only pass
`props` where `typeof props[k] !== 'function'`, where `k` is some key.

Even if your form is not receiving any props from its parent, use
`mapPropsToValues` to initialize your forms empty state.

#### `validate?: (values: Values, props: Props) => FormikErrors<Values> | Promise<any>`

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

#### `validateOnBlur?: boolean`

Default is `true`. Use this option to run validations on `blur` events. More
specifically, when either [`handleBlur`], [`setFieldTouched`], or [`setTouched`]
are called.

#### `validateOnChange?: boolean`

Default is `true`. Use this option to tell Formik to run validations on `change`
events and `change`-related methods. More specifically, when either
[`handleChange`], [`setFieldValue`], or [`setValues`] are called.

#### `validationSchema?: Schema | ((props: Props) => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup
schema. This is used for validation. Errors are mapped by key to the inner
component's [`errors`]. Its keys should match those of [`values`].

### Injected props and methods

These are identical to the props of `<Formik render={props => ...} />`

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
