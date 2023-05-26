---
'formik': patch
---

Fixed field error state for array fields that have an error and become empty through an API like `arrayHelpers.remove`.

The prior behavior resolved the field error to `[undefined]`, now it is simply `undefined`.
