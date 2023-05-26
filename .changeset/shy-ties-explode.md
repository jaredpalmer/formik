---
'formik': patch
---

Fix potential infinite loop scenario when `initialValues` changes but `enableReinitialize` is not truthy.
