---
id: form
title: <Form />
---

Form is a small wrapper around an HTML `<form>` element that automatically hooks into Formik's `handleSubmit`.

```jsx
<form onSubmit={formikProps.handleSubmit} {...props} />
```
