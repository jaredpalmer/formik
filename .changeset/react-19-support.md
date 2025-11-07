---
"formik": patch
---

Replace JSX.IntrinsicElements with React.JSX.IntrinsicElements for React 19 compatibility. The global JSX namespace was removed in React 19, so we now use React.JSX.IntrinsicElements instead.
