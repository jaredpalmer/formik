# formik

## 3.0.0-next.8

### Patch Changes

- [`0e57c8d`](https://github.com/formium/formik/commit/0e57c8d12d5610caf07e4ab8963568d530c2c816) [#2939](https://github.com/formium/formik/pull/2939) Thanks [@seropaski](https://github.com/seropaski)! - Add `useSetFieldValue` and `useSetFieldTouched` hooks

## 3.0.0-next.7

### Patch Changes

- [`90fd693`](https://github.com/formium/formik/commit/90fd693b0900e1b82ff56b39bd1a020327c0bcb6) [#2921](https://github.com/formium/formik/pull/2921) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Add hooks `useSetValue`, `useSetErrors`, `useSetTouched`, `useSetStatus`, `useSubmitForm`, `useResetForm`, `useIsSubmitting`, `useIsValid`, `useIsDirty`, `useValidateForm`, `useValidateField`

## 3.0.0-next.6

### Patch Changes

- [`4e515a4`](https://github.com/formium/formik/commit/4e515a4ab336863db69d81611275231e9301b7df) [#2846](https://github.com/formium/formik/pull/2846) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Fix useFieldTouched selector

## 3.0.0-next.5

### Patch Changes

- [`50433fa`](https://github.com/formium/formik/commit/50433fa3cec2cb1ae11176dc713d5f011fcc758d) [#2846](https://github.com/formium/formik/pull/2846) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Implement useField field.onBlur to avoid rerendering entire form on blur events

## 3.0.0-next.4

### Patch Changes

- [`0ad41eb`](https://github.com/formium/formik/commit/0ad41ebc8ddd8d7fa40dc7364b7cdcfcc4b8c298) [#2903](https://github.com/formium/formik/pull/2903) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Renames `unstable_StrictField` to `FastField` and thus deprecates `<FastField shouldUpdate>` prop. If you need this functionality, use `useFormikContext()` and `useField()` in a custom component wrapped in `React.memo()` instead. In addition, and this is breaking, `FastField` is no longer passed `form` object in any render prop.

  If you still need to access the `form` object in render use `FormikConsumer` like so:

  ```diff
  - import { FastField } from 'formik'
  + import { FastField, FormikConsumer } from 'formik'

  <FastField name="firstName">
  - {({ field, meta, form }) => ( /* ... */ )}
  + {({ field, meta }) => (
  +   <FormikConsumer>{form => /* ... */}</FormikConsumer>
  + )}
  </FastField>
  ```

## 3.0.0-next.3

### Patch Changes

- [`6383b86`](https://github.com/formium/formik/commit/6383b86d3123a3348e4fa6abba4fe0c3652cb5a4) [#2893](https://github.com/formium/formik/pull/2893) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Added optimized Form, ErrorMessage, and the following additional optimized field-level hooks
  and components that only rerender when their respective slices have changed:

  - `unstable_useFieldValue`
  - `unstable_useFieldTouched`
  - `unstable_useFieldError`
  - `unstable_useStrictField`
  - `unstable_StrictField`

  In addition, there is a very very unstable `unstable_useFormikContextSelector` that we'll be using
  to prototype other APIss in product that is also included. This will definitely **not** be released, so you have been warned.

## 3.0.0-next.2

## 2.2.5

### Patch Changes

- [`ebad985`](https://github.com/formium/formik/commit/ebad98569e034c5bd8f52a7926480b7d63127cd4) [#2891](https://github.com/formium/formik/pull/2891) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Remove low-priority validation implementation

* [`0dfa23b`](https://github.com/formium/formik/commit/0dfa23b6b312db1f2c3d22019975212f0f901c00) [#2889](https://github.com/formium/formik/pull/2889) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Fixed botched typescript builds including scheduler types

## 2.2.4

### Patch Changes

- [`199e77a`](https://github.com/formium/formik/commit/199e77a3f69e9886d88fc7114c37769cd365d9c6) [#2882](https://github.com/formium/formik/pull/2882) Thanks [@umidbekkarimov](https://github.com/umidbekkarimov)! - Validate `setFieldTouched` with high priority

## 2.2.3

### Patch Changes

- [`e0a28e6`](https://github.com/formium/formik/commit/e0a28e6872ebfd06e636aac84829b60d704b0694) [#2867](https://github.com/formium/formik/pull/2867) Thanks [@umidbekkarimov](https://github.com/umidbekkarimov)! - Fix low priority validation for browser password autofill.

* [`958d67c`](https://github.com/formium/formik/commit/958d67ca2c3e006031c31150ea0a42248b28ffc7) [#2874](https://github.com/formium/formik/pull/2874) Thanks [@maddhruv](https://github.com/maddhruv)! - fix FastField initial value when input type is radio or checkbox

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
