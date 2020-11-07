# formik

## 3.0.0-next.1

### Patch Changes

- [`1c2175a`](https://github.com/formium/formik/commit/1c2175a24b1d1223b4cdedf424ef62057edf0063) [#2848](https://github.com/formium/formik/pull/2848) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Ensure that parse and format aren't passed through in Field components

## 3.0.0-next.0

### Major Changes

- [`5efd691`](https://github.com/formium/formik/commit/5efd691b8784fda6645d362189f55c618f030758) [#2255](https://github.com/formium/formik/pull/2255) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Added `parse`, `format`, and `formatOnBlur` to `getFieldProps` options, `<Field>`, and `useField`. Going forward, there is no reason aside from backwards compatibility to continue using either `formikProps.handleChange` or `formikProps.handleBlur`. These are both inferior to the `onChange` and `onBlur` functions returned by `getFieldProps()` which the ability to utilize `parse`, `format`, and `formatOnBlur`.

  **Breaking Change**
  Instead of just passing back `formikProps.handleChange` and `formikProps.handleBlur`, the `onChange` and `onBlur` handlers returned by `getFieldProps()` (and thus `useField`/`<Field>`) are now scoped to the field already and now accept either a React Synthetic event or a value. In the past, you could need to curry the handler with the string name of field to get this functionality. This likely doesn't impact many users, but it is technically breaking nonetheless.

## 2.2.2

### Patch Changes

- [`00f95ec`](https://github.com/formium/formik/commit/00f95ec4ec5266eed8ad4e97b76321205c704d51) [#2854](https://github.com/formium/formik/pull/2854) Thanks [@umidbekkarimov](https://github.com/umidbekkarimov)! - Fix low priority validation race condition.

## 2.2.1

### Patch Changes

- [`e04886d`](https://github.com/formium/formik/commit/e04886db15c7e9b96516b4bd5a1b89d0e895bb7d) [#2820](https://github.com/formium/formik/pull/2820) Thanks [@wellyshen](https://github.com/wellyshen)! - Fixed bug with scheduler and `validateFormWithLowPriority` method not be scheduled correctly

## 2.2.0

### Minor Changes

- [`4148181`](https://github.com/formium/formik/commit/41481819f9187de79c4d948aeaa4ca1d33c53ed7) [#2794](https://github.com/formium/formik/pull/2794) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - `setValue` can now optionally accept a function as a callback, exposing `React.SetStateAction` functionality. Previously, only the entire object was
  allowed which caused issues with stale props.

  ```tsx
  setValues(prevValues => ({...prevValues, ... }))
  ```

## 2.1.7

### Patch Changes

- [`bda9f41`](https://github.com/formium/formik/commit/bda9f41931fac382eec26b4f1283b881b6bbc240) [#2785](https://github.com/formium/formik/pull/2785) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Replace all instances of the deprecated React.SFC type with React.FC
