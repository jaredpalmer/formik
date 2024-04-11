---
'formik': patch
---

Changing the state inside formik was changing reference of initialValues provided via props, deep cloning the initialvalues will fix it.
