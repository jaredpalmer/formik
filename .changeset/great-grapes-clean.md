---
"formik": minor
---

`setValue` can now optionally accept a function as a callback, exposing `React.SetStateAction` functionality. Previously, only the entire object was
allowed which caused issues with stale props.

```tsx
setValues(prevValues => ({...prevValues, ... }))
```
