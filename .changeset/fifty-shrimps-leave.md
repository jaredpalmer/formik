---
"formik-native": major
"formik": major
"app": major
---

Use FormikApi + FormikState Subscriptions

Switch underlying state implementation to use a subscription, and access that subscription via `useFormik().useState()` or its alias, `useFormikState()`.
useFormikContext() only contains a stable API as well as some config props which should eventually be moved to a separate FormikConfigContext for further optimization.
