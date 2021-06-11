---
'formik': patch
---

Changed `getIn` to return undefined when it can't find a value AND a parent of that value is "falsy" ( "" / 0 / null / false )
