---
'formik': patch
---

Fix infinite loop issue in `Field` when field helpers (`setTouched`, etc) are used as an argument in `React.useEffect`.
