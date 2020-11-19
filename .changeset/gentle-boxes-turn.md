---
'formik': patch
---

Added optimized Form, ErrorMessage, and the following additional optimized field-level hooks
and components that only rerender when their respective slices have changed:

- `unstable_useFieldValue`
- `unstable_useFieldTouched`
- `unstable_useFieldError`
- `unstable_useStrictField`
- `unstable_StrictField`

In addition, there is a very very unstable `unstable_useFormikContextSelector` that we'll be using
to prototype other APIss in product that is also included. This will definitely **not** be released, so you have been warned.
