---
'formik': patch
---

The validateField function now consistently returns Promise<string | undefined> across all validation paths, matching its type definition where `string` represents a validation error message, `undefined` represents a successful validation.

while previous implementation:
- field-level validation returned Promise<string | undefined>
- default case and schema validation returned Promise<void>