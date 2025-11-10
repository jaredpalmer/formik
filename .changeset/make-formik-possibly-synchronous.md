---
'formik': minor
---

Formik might not need to run asynchronously, it all depends on the validation functions. This change makes it all run synchronously if the validation functions do not return any promise, making all the updates much faster and creating les re-renders.