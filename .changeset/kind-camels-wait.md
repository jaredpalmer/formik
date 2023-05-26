---
'formik': minor
---

Added typescript generics to `ArrayHelpers` interface and its methods so that users who use TypeScript can set the type for their arrays and have type safety on array utils. I have also gone ahead and made supplying a type for the generic optional for the sake of backwards compatibility so any existing TS code that does not give a type for the FieldArray will continue to work as they always have.
