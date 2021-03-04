---
'formik': patch
---

Allow explicitly setting `<form action>` to empty string (#2981). Note: previous code which passed an empty string would result in a noop (simply appending # to the url), but this will now result in a form submission to the current page.
