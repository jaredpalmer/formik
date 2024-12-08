---
'formik': patch
---

The validateField function now consistently returns Promise<string | undefined> across all validation paths, where `string` represents a validation error message, `undefined` represents a successful validation.

while previous implementation:
- validation via `<Field validate={...}>` returned Promise<string | undefined>
- validation via schema returned Promise<void>