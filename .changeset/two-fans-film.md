---
'formik': patch
---

Renames `unstable_StrictField` to `FastField` and thus deprecates `<FastField shouldUpdate>` prop. If you need this functionality, use `useFormikContext()` and `useField()` in a custom component wrapped in `React.memo()` instead. In addition, and this is breaking, `FastField` is no longer passed `form` object in any render prop.

If you still need to access the `form` object in render use `FormikConsumer` like so:

```diff
- import { FastField } from 'formik'
+ import { FastField, FormikConsumer } from 'formik'

<FastField name="firstName">
- {({ field, meta, form }) => ( /* ... */ )}
+ {({ field, meta }) => (
+   <FormikConsumer>{form => /* ... */}</FormikConsumer>
+ )}
</FastField>
```
