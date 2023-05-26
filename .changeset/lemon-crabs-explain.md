---
'formik': minor
---

Yup by default only allows for cross-field validation within the
same field object. This is not that useful in most scenarios because
a sufficiently-complex form will have several `yup.object()` in the
schema.

```ts
const deepNestedSchema = Yup.object({
  object: Yup.object({
    nestedField: Yup.number().required(),
  }),
  object2: Yup.object({
    // this doesn't work because `object.nestedField` is outside of `object2`
    nestedFieldWithRef: Yup.number().min(0).max(Yup.ref('object.nestedField')),
  }),
});
```

However, Yup offers something called `context` which can operate across
the entire schema when using a \$ prefix:

```ts
const deepNestedSchema = Yup.object({
  object: Yup.object({
    nestedField: Yup.number().required(),
  }),
  object2: Yup.object({
    // this works because of the "context" feature, enabled by $ prefix
    nestedFieldWithRef: Yup.number().min(0).max(Yup.ref('$object.nestedField')),
  }),
});
```

With this change, you may now validate against any field in the entire schema,
regardless of position when using the \$ prefix.
