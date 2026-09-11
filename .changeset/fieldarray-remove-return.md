---
'formik': patch
---

`FieldArray` `remove()` and `pop()` now return the removed value even when it is falsy, and `pop()` also shortens the errors and touched arrays like it already did for values.
