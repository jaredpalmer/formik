---
'formik': patch
---

Improve performance of the `FieldArray` component by adding a `shouldComponentUpdate` check; this should help avoid unnecessary re-renders which may affect the performance of a form.
