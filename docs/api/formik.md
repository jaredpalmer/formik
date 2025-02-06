---
id: formik
title: <Formik />
---

`<Formik>` is a component that helps you with building forms. It uses a render
props pattern made popular by libraries like React Motion and React Router.

## Example

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
    >
      {props => (
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
    </Formik>
  </div>
);
```

#### Props

---

# Reference

## Props

### Formik render methods and props

There are 2 ways to render things with `<Formik />`

- `<Formik component>`
- `<Formik children>`
- ~~`<Formik render>`~~ Deprecated in 2.x

Each render methods will be passed the same props:

#### `dirty: boolean`

Returns `true` if values are not deeply equal from initial values, `false` otherwise.
`dirty` is a readonly computed property and should not be mutated directly.

#### `errors: { [field: string]: string }`

Form validation errors. Should match the shape of your form's `values` defined
in `initialValues`. If you are using `validationSchema` (which you should be),
keys and shape will match your schema exactly. Internally, Formik transforms raw
[Yup validation errors](https://github.com/jquense/yup#validationerrorerrors-string--arraystring-value-any-path-string)
on your behalf. If you are using `validate`, then that function will determine
the `errors` objects shape.

#### `handleBlur: (e: any) => void`

`onBlur` event handler. Useful for when you need to track whether an input has
been `touched` or not. This should be passed to `<input onBlur={handleBlur} ... />`

#### `handleChange: (e: React.ChangeEvent<any>) => void`

General input change event handler. This will update the `values[key]` where
`key` is the event-emitting input's `name` attribute. If the `name` attribute is
not present, `handleChange` will look for an input's `id` attribute. Note:
"input" here means all HTML inputs.

#### `handleReset: () => void`

Reset handler. Will reset the form to its initial state. This should be passed
to `<button onClick={handleReset}>...</button>`

#### `handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void`

Submit handler. This should be passed to `<form onSubmit={props.handleSubmit}>...</form>`. To learn more about the submission process, see [Form Submission](../guides/form-submission.md).

#### `isSubmitting: boolean`

Submitting state of the form. Returns `true` if submission is in progress and `false` otherwise. IMPORTANT: Formik will set this to `true` as soon as submission is _attempted_. To learn more about the submission process, see [Form Submission](../guides/form-submission.md).

#### `isValid: boolean`

Returns `true` if there are no `errors` (i.e. the `errors` object is empty) and `false` otherwise.

> Note: `isInitialValid` was deprecated in 2.x. However, for backwards compatibility, if the `isInitialValid` prop is specified, `isValid` will return `true` if the there are no `errors`, or the result of `isInitialValid` of the form if it is in "pristine" condition (i.e. not `dirty`).

#### `isValidating: boolean`

Returns `true` if Formik is running validation during submission, or by calling [`validateForm`] directly `false` otherwise. To learn more about what happens with `isValidating` during the submission process, see [Form Submission](../guides/form-submission.md).

#### `resetForm: (nextState?: Partial<FormikState<Values>>) => void`

Imperatively reset the form. The only (optional) argument, `nextState`, is an object on which any of these `FormikState` fields are optional:

```ts
interface FormikState<Values> {
  /** Form values */
  values: Values;
  /** map of field names to specific error for that field */
  errors: FormikErrors<Values>;
  /** map of field names to **whether** the field has been touched */
  touched: FormikTouched<Values>;
  /** whether the form is currently submitting */
  isSubmitting: boolean;
  /** whether the form is currently validating (prior to submission) */
  isValidating: boolean;
  /** Top level status state, in case you need it */
  status?: any;
  /** Number of times user tried to submit the form */
  submitCount: number;
}
```

If `nextState` is specified, Formik will set `nextState.values` as the new "initial state" and use the related values of `nextState` to update the form's `initialValues` as well as `initialTouched`, `initialStatus`, `initialErrors`. This is useful for altering the initial state (i.e. "base") of the form after changes have been made.

```tsx
// typescript usage
function MyForm(props: MyFormProps) {
  // using TSX Generics here to set <Values> to <Blog>
  return (
    <Formik<Blog>
      initialValues={props.initVals}
      onSubmit={(values, actions) => {
        props.onSubmit(values).then(() => {
          actions.setSubmitting(false);
          actions.resetForm({
            values: {
              // the type of `values` inferred to be Blog
              title: '',
              image: '',
              body: '',
            },
            // you can also set the other form states here
          });
        });
      }}
    >
      // etc
    </Formik>
  );
}
```

If `nextState` is omitted, then Formik will reset state to the original initial state. The latter is useful for calling `resetForm` within `componentDidUpdate` or `useEffect`.

```tsx
actions.resetForm();
```

#### `setErrors: (fields: { [field: string]: string }) => void`

Set `errors` imperatively.

#### `setFieldError: (field: string, errorMsg: string) => void`

Set the error message of a field imperatively. `field` should match the key of
`errors` you wish to update. Useful for creating custom input error handlers.

#### `setFieldTouched: (field: string, isTouched?: boolean, shouldValidate?: boolean) => Promise<void | FormikErrors>`

Set the touched state of a field imperatively. `field` should match the key of
`touched` you wish to update. Useful for creating custom input blur handlers. Calling this method will trigger validation to run if `validateOnBlur` is set to `true` (which it is by default). `isTouched` defaults to `true` if not specified. You can also explicitly prevent/skip validation by passing a third argument as `false`.

If `validateOnBlur` is set to `true` and there are errors, they will be resolved in the returned `Promise`.

#### `submitForm: () => Promise`

Trigger a form submission. The promise will be rejected if form is invalid.

#### `submitCount: number`

Number of times user tried to submit the form. Increases when [`handleSubmit`](#handlesubmit-e-reactformeventhtmlformelement--void) is called, resets after calling
[`handleReset`](#handlereset---void). `submitCount` is readonly computed property and should not be mutated directly.

#### `setFieldValue: (field: string, value: React.SetStateAction<any>, shouldValidate?: boolean) => Promise<void | FormikErrors>`

Set the value of a field imperatively. `field` should match the key of
`values` you wish to update. Useful for creating custom input change handlers. Calling this will trigger validation to run if `validateOnChange` is set to `true` (which it is by default). You can also explicitly prevent/skip validation by passing a third argument as `false`.

If `validateOnChange` is set to `true` and there are errors, they will be resolved in the returned `Promise`.

#### `setStatus: (status?: any) => void`

Set a top-level `status` to anything you want imperatively. Useful for
controlling arbitrary top-level state related to your form. For example, you can
use it to pass API responses back into your component in `handleSubmit`.

#### `setSubmitting: (isSubmitting: boolean) => void`

Set `isSubmitting` imperatively. You would call it with `setSubmitting(false)` in your `onSubmit` handler to finish the cycle. To learn more about the submission process, see [Form Submission](../guides/form-submission.md).

#### `setTouched: (fields: { [field: string]: boolean }, shouldValidate?: boolean) => Promise<void | FormikErrors>`

Set `touched` imperatively. Calling this will trigger validation to run if `validateOnBlur` is set to `true` (which it is by default). You can also explicitly prevent/skip validation by passing a second argument as `false`.

If `validateOnBlur` is set to `true` and there are errors, they will be resolved in the returned `Promise`.

#### `setValues: (fields: React.SetStateAction<{ [field: string]: any }>, shouldValidate?: boolean) => Promise<void | FormikErrors<Values>>`

Set `values` imperatively. Calling this will trigger validation to run if `validateOnChange` is set to `true` (which it is by default). You can also explicitly prevent/skip validation by passing a second argument as `false`.

If `validateOnChange` is set to `true` and there are errors, they will be resolved in the returned `Promise`.

#### `status?: any`

A top-level status object that you can use to represent form state that can't
otherwise be expressed/stored with other methods. This is useful for capturing
and passing through API responses to your inner component.

`status` should only be modified by calling
[`setStatus`](#setstatus-status-any--void).

#### `touched: { [field: string]: boolean }`

Touched fields. Each key corresponds to a field that has been touched/visited.

#### `values: { [field: string]: any }`

Your form's values. Will have the shape of the result of `mapPropsToValues`
(if specified) or all props that are not functions passed to your wrapped
component.

#### `validateForm: (values?: any) => Promise<FormikErrors<Values>>`

Imperatively call your `validate` or `validateSchema` depending on what was specified. You can optionally pass values to validate against and this modify Formik state accordingly, otherwise this will use the current `values` of the form.

#### `validateField: (field: string) => void`

Imperatively call field's `validate` function if specified for given field or run schema validation using [Yup's `schema.validateAt`](https://github.com/jquense/yup#mixedvalidateatpath-string-value-any-options-object-promiseany-validationerror) and the provided top-level `validationSchema` prop. Formik will use the current field value.

### `component?: React.ComponentType<FormikProps<Values>>`

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
);
```

**Warning:** `<Formik component>` takes precedence over `<Formik render>` so
don’t use both in the same `<Formik>`.

### `render: (props: FormikProps<Values>) => ReactNode`

**Deprecated in 2.x**

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

### `children?: React.ReactNode | (props: FormikProps<Values>) => ReactNode`

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

### `enableReinitialize?: boolean`

Default is `false`. Control whether Formik should reset the form if
`initialValues` changes (using deep equality).

### `isInitialValid?: boolean`

**Deprecated in 2.x, use `initialErrors` instead**

Control the initial value of `isValid` prop prior to
mount. You can also pass a function. Useful for situations when you want to
enable/disable a submit and reset buttons on initial mount.

### `initialErrors?: FormikErrors<Values>`

Initial field errors of the form, Formik will make these values available to
render methods component as `errors`.

Note: `initialErrors` is not available to the higher-order component `withFormik`, use
`mapPropsToErrors` instead.

### `initialStatus?: any`

An arbitrary value for the initial `status` of the form. If the form is reset, this value will be restored.

Note: `initialStatus` is not available to the higher-order component `withFormik`, use
`mapPropsToStatus` instead.

### `initialTouched?: FormikTouched<Values>`

Initial visited fields of the form, Formik will make these values available to
render methods component as `touched`.

Note: `initialTouched` is not available to the higher-order component `withFormik`, use
`mapPropsToTouched` instead.

### `initialValues: Values`

Initial field values of the form, Formik will make these values available to
render methods component as `values`.

Even if your form is empty by default, you must initialize all fields with
initial values otherwise React will throw an error saying that you have changed
an input from uncontrolled to controlled.

Note: `initialValues` not available to the higher-order component, use
`mapPropsToValues` instead.

### `onReset?: (values: Values, formikBag: FormikBag, initialValues: FormikBag) => void`

Your optional form reset handler. It is passed your forms `values` and the
"FormikBag".

### `onSubmit: (values: Values, formikBag: FormikBag) => void | Promise<any>`

Your form submission handler. It is passed your forms `values` and the
"FormikBag", which includes an object containing a subset of the
[injected props and methods](#formik-render-methods-and-props) (i.e. all the methods
with names that start with `set<Thing>` + `resetForm`) and any props that were
passed to the wrapped component.

Note: `errors`, `touched`, `status` and all event handlers are NOT
included in the `FormikBag`.

> IMPORTANT: If `onSubmit` is async, then Formik will automatically set `isSubmitting` to `false` on your behalf once it has resolved. This means you do NOT need to call `formikBag.setSubmitting(false)` manually. However, if your `onSubmit` function is synchronous, then you need to call `setSubmitting(false)` on your own.

### `validate?: (values: Values) => FormikErrors<Values> | Promise<any>`

_Note: I suggest using `validationSchema` and Yup for validation. However,
`validate` is a dependency-free, straightforward way to validate your forms._

Validate the form's `values` with function. This function can either be:

1. Synchronous and return an `errors` object.

```js
// Synchronous validation
const validate = values => {
  const errors = {};

  if (!values.email) {
    errors.email = 'Required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }

  //...

  return errors;
};
```

- Asynchronous and return a Promise that's resolves to an object containing `errors`

```js
// Async Validation
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const validate = values => {
  return sleep(2000).then(() => {
    const errors = {};
    if (['admin', 'null', 'god'].includes(values.username)) {
      errors.username = 'Nice try';
    }
    // ...
    return errors;
  });
};
```

### `validateOnBlur?: boolean`

Default is `true`. Use this option to run validations on `blur` events. More
specifically, when either `handleBlur`, `setFieldTouched`, or `setTouched`
are called.

### `validateOnChange?: boolean`

Default is `true`. Use this option to tell Formik to run validations on `change`
events and `change`-related methods. More specifically, when either
`handleChange`, `setFieldValue`, or `setValues` are called.

### `validateOnMount?: boolean`

Default is `false`. Use this option to tell Formik to run validations when the `<Formik />` component mounts
and/or `initialValues` change.

### `validationSchema?: Schema | (() => Schema)`

[A Yup schema](https://github.com/jquense/yup) or a function that returns a Yup
schema. This is used for validation. Errors are mapped by key to the inner
component's `errors`. Its keys should match those of `values`.
