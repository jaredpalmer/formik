---
'formik': minor
---

Previously, the ʻuseFormik hook would return a new object each time. Because of this, its result could not be used as a dependency for other hooks. Now ʻuseFormik will always return the same object.
