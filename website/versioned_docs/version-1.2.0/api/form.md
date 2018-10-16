---
id: version-1.2.0-form
title: <Form />
custom_edit_url: https://github.com/jaredpalmer/formik/edit/master/docs/api/form.md
original_id: form
---

Form is a small wrapper around an HTML `<form>` element that automatically hooks into Formik's `handleSubmit`. All other props are passed directly through to the DOM node.

```jsx
// so...
<Form />

// is identical to this...
<form onSubmit={formikProps.handleSubmit} {...props} />
```
