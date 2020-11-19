# Formik 3 Migration Guide

## Breaking changes

- `FastField` no longer accepts `shouldUpdate` prop. Given the new implementation of `FastField`, this functionality is likely no longer needed anyways.
- `FastField` is no longer passed a `form` object (which contained `formikProps` in any render prop. If you still need to access the `form` object in the render prop use regular `Field` (which updates on every render).
- Instead of just passing back `formikProps.handleChange` and `formikProps.handleBlur`, the `onChange` and `onBlur` handlers returned by `getFieldProps()` and `useField`/`<Field>`/`<FastField>`) are now scoped to the field already and now accept either a React Synthetic event or a value. In the past, you could curry the handler with the string name of field to get this functionality. This likely doesn't impact many users, but it is technically breaking nonetheless.

## Improvements

- Selective rendering!
- `<Form>`, `<ErrorMessage>`, and `<FastField>` have been re-implemented to optimize rendering (i.e. minimally re-render)
- `useField()` no longer updates on every key stroke, but only when that field is updated. This is a massive performance boost.
- Added `parse`, `format`, and `formatOnBlur` to `getFieldProps` options, `<Field>`, and `useField`. Going forward, there is no reason aside from backwards compatibility to continue using either `formikProps.handleChange` or `formikProps.handleBlur`. These are both inferior to the `onChange` and `onBlur` functions returned by `getFieldProps()`, `<Field>`/`<FastField>`'s `field` object, or `useField` which have the ability to utilize `parse`, `format`, and `formatOnBlur`.
- **New Hooks!**
  - `useFieldInitialValue`
  - `useFieldInitialTouched`
  - `useFieldInitialError`
  - `useInitialValues`
  - `useInitialErrors`
  - `useInitialTouched`
  - `useInitialStatus`
  - `useFieldTouched`
  - `useFieldValue`
  - `useFieldError`
  - `useValues`
  - `useSetValue`
  - `useSetErrors`
  - `useErrors`
  - `useTouched`
  - `useSetTouched`
  - `useStatus`
  - `useSetStatus`
  - `useSubmitForm`
  - `useResetForm`
  - `useIsSubmitting`
  - `useIsValid`
  - `useIsDirty`
  - `useValidateForm`
  - `useValidateField`

## Performance Suggestions

- Prefer `<FastField>` to `<Field>`
- Prefer a custom component with `useField()` over `<Field>`
- The new helpers in `field.onChange` and `field.onBlur` returned from `useField()` can now handle either events or raw values. There is thus no need to call `useFormikContext` just to access `setFieldValue` and `setFieldBlur` anymore if you're updating the same field.
- Move away from using `useFormikContext` and instead use one or more of the above hooks (ideally only the `useFieldXXX` ones if you can). `useFormikContext`, `useValues`, `useTouched` and `useErrors` hooks will rerender any components that use them when they change. Unless you're making a debugger, in most cases, your field or component doesn't need all of Formik state and so instead, use the new `useFieldXXX` hooks which will only rerender if that particular slice of Formik state updates.
