---
"formik": patch
---

Fix issue with FieldArray error messages when using min/max. Validation errors should be returned properly as a string for top level errors, or an array for nested value errors. The (documentation)[https://formik.org/docs/api/fieldarray#fieldarray-validation-gotchas] calls out this expected behavior
