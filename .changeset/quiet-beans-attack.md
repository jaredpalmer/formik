---
'formik': major
---

Added `parse`, `format`, and `formatOnBlur` to `getFieldProps` options, `<Field>`, and `useField`. Going forward, there is no reason aside from backwards compatibility to continue using either `formikProps.handleChange` or `formikProps.handleBlur`. These are both inferior to the `onChange` and `onBlur` functions returned by `getFieldProps()` which the ability to utilize `parse`, `format`, and `formatOnBlur`.

**Breaking Change**
Instead of just passing back `formikProps.handleChange` and `formikProps.handleBlur`, the `onChange` and `onBlur` handlers returned by `getFieldProps()` (and thus `useField`/`<Field>`) are now scoped to the field already and now accept either a React Synthetic event or a value. In the past, you could need to curry the handler with the string name of field to get this functionality. This likely doesn't impact many users, but it is technically breaking nonetheless.
