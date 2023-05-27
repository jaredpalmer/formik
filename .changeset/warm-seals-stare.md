---
'formik': patch
---

Fixed the use of generics for the `ArrayHelpers` type such that `any[]` is the default array type and for each individual method the array item type can be overridden if necessary.
