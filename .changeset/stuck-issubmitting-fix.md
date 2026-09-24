---
'formik': patch
---

Reset `isSubmitting` and `isValidating` when validation throws an error, and reset `isSubmitting` when `onSubmit` throws synchronously. Before this, the form was stuck in a submitting state forever.
