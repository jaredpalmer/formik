---
title: Formik 3 Alpha
date: October 27, 2020
published: true
slug: formik-3-alpha
authors:
  - Jared Palmer
preview: |
  Today, we cut the very first release of Formik v3 alpha. The reason for this blog post is that there is a small breaking change that we unfortunately have no way of warning you about like we usually do with deprecation notices due to its nature.
---

Today, we cut the very first release of Formik v3 alpha. You can install it with:

```jsx
npm install formik@next
```

The reason for this blog post is that there is a small breaking change that we unfortunately have no way of warning you about like we usually do with deprecation notices due to its nature.

---

But, before we get into the bad news, let's first share the good news:

## New `parse`, `format`, and `formatOnBlur` props!

The new alpha release contains new `parse` , `format`, and `formatOnBlur` props for `getFieldProps`, `<Field>`, and `useField()`. These props make it a lot easier to implement [input masking](https://css-tricks.com/input-masking/)—a technique where you alter the format of the raw value of an input to make it appear in a certain way to the user (e.g. like a phone number (917) 555-1234 or a text-based date 10/2020). For you TypeScript friends here's what's new:

```tsx
interface FieldConfig<V> {
  // ...omitted for brevity

  /**
   * Function to parse raw input value before setting it to state
   */
  parse?: (rawInput: string, name: string) => V;

  /**
   * Function to transform value passed to input
   */
  format?: (value: V, name: string) => any;

  /**
   * Should Formik wait until the blur event before formatting input value?
   * @default false
   */
  formatOnBlur?: boolean;
}

// ...elsewhere...

const [field] = useField({ name: 'phone', parse: rawInput => ... })
<Field name="phone" parse={rawInput => ... } />
<input {...formikProps.getFieldProps({ name: 'phone', parse: rawInput => ... }) />
```

And here's a full example that uses the `[format-string-by-pattern](https://www.npmjs.com/package/format-string-by-pattern)` package to create various phone number input masks. Notice on the first input that even though you type 9999999999 the input's value (and Formik's internal value) is 999-999-9999. Neat!

[https://codesandbox.io/s/github/jaredpalmer/formik/tree/next/examples/format-string-by-pattern?fontsize=14&hidenavigation=1&theme=dark&file=/index.js](https://codesandbox.io/s/github/jaredpalmer/formik/tree/next/examples/format-string-by-pattern?fontsize=14&hidenavigation=1&theme=dark&file=/index.js)

**\*Pro Tip:** I'm all about making intuitive API's and so I'm aware that `parse` and `format` are hard to remember. The trick I've been using / saying in my head is as follows: "format" → sounds like "from" → "from Formik" → from Formik to input. Again, this is an alpha, so if it's too confusing, we'll rename these.\*

## A Breaking Change

To support this new behavior, we needed to make a breaking change to the way that `onChange` and `onBlur` handlers work when returned from `formikProps.getFieldProps()`, which subsequently impacts `useField()` and `Field` as well.

In the past, these `onChange` and `onBlur` methods were identical to `formikProps.handleChange` and `formikProps.handleBlur` (returned by `useFormik()` or by the render prop `<Formik>` or `withFormik`). However, as of 3.0.0-next.0, these methods behave differently, respectively.

When returned from `getFieldProps`, `useField`, or `<Field>`'s render prop, `onChange` and `onBlur` are now already scoped to the given field and can now accept either a React Synthetic event or an arbitrary value. They no longer can be curried like `handleChange` and `handleBlur` can.

### Some Examples

Here are some more concrete examples for you of what works and what doesn't work...

**Still works, but does not support `parse`, `format`, and `formatOnBlur`**

```tsx
export const MyReactNativeForm = props => (
  <Formik
    initialValues={{ email: '' }}
    onSubmit={values => console.log(values)}
  >
    {({ handleChange, handleBlur, handleSubmit, values }) => (
      <View>
        <TextInput
          onChangeText={handleChange('email')} // curried
          onBlur={handleBlur('email')} // curried
          value={values.email}
        />
        <Button onPress={handleSubmit} title="Submit" />
      </View>
    )}
  </Formik>
);
```

**No longer works**

```tsx
export const MyTextField = props => {
  const [field] = useField(props);
  const onChange = e => {
    e.persist();
    if (e.target.value === 'foo') {
      // Using the curried version of onChange,
      // effectively equivalent to setFieldValue() no longer works
      field.onChange(props.name)('bar');
    } else {
      field.onChange(e);
    }
  };
  return <input {...field} onChange={onChange} />;
};
```

**But instead you can just do this...**

```tsx
export const MyTextField = props => {
  const [field] = useField(props);
  const onChange = e => {
    e.persist();
    if (e.target.value === 'foo') {
      // You can now just set the value
      field.onChange('bar');
    } else {
      // Or pass an event
      field.onChange(e);
    }
  };
  return <input {...field} onChange={onChange} />;
};
```

Normally, this small change wouldn't cause a major version bump, but because we no longer know if you are currying the `onChange` method or are actually intending to set the string argument as a value we can't fire off a warning to save you from yourself. 🤷‍♂️

## What's next?

The primary goal of Formik v3 is to improve performance, ergonomics, and a11y, but also to recover from certain bets we made around React hooks that never happened (like context selectors). Unfortunately, to get where we want to go, there will be some more breaking changes and/or new components that will need to be introduced to the Formik family. The plan is to roll these out on the `next` branch over the next few weeks, argue about naming for a bit, and then decide either to split some of the existing components into their own packages (a la `prop-types`) and/or write codemods to automate the migration path. Either way, Formik is getting faster...A lot lot faster, which is something that's long overdue.
