---
'formik': patch
---

Strip own `__proto__` keys from validation errors before merging them, so an error object created with `JSON.parse` can no longer replace the prototype of the merged `errors`.
