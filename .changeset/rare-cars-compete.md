---
'formik': patch
---

Revert `FieldArray` "shouldComponentUpdate" performance optimization. As it turns out, it's a common use case to have JSX controlled via non-Formik state/props inside of `FieldArray`, so it's not safe to cancel re-renders here.
