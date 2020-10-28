---
'formik': patch
---

Previously, the `useFormik` hook would return a new object each time. 
Because of this, its result could not be used as a dependency for other 
hooks. Now `useFormik` will always return the same object.
