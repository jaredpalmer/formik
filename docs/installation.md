---
id: installation
title: Installation
---

You can install Formik with [NPM](https://npmjs.com),
[Yarn](https://yarnpkg.com), or a good ol' `<script>` via
[unpkg.com](https://unpkg.com). Formik is compatible with React v15.x and v16.x (last 2 major versions) and works with ReactDOM and React Native.

## NPM

```sh
npm install formik --save
# or
yarn add formik
```

## CDN

If you're not using a module bundler or package manager we also have a global ("UMD") build hosted on the [unpkg.com](https://unpkg.com) CDN. Simply add the following `<script>` tag to the bottom of your HTML file:

```html
<script src="https://unpkg.com/formik/dist/formik.umd.production.js"></script>
```

Once you've added this you will have access to the `window.Formik.<Insert_Component_Here>` variables. For example,
to use `<Field />`, you would write `var Field = window.Formik.Field` and in your React code use `<Field>` or `React.createElement(Field, ...)`.

> This installation/usage requires the [React CDN script bundles](https://reactjs.org/docs/cdn-links.html) to be on the page as well.

## In-browser Playgrounds

You can play with Formik in your web browser with these live online playgrounds.

* CodeSandbox (ReactDOM) https://codesandbox.io/s/zKrK5YLDZ
* Expo Snack (React Native) https://snack.expo.io/Bk9pPK87X

## TypeScript

Formik's source code is written with TypeScript v3.x.x and so its types ship with the package on NPM/Yarn. No additional tooling or packages are needed.

See the TypeScript guide for more information.

## FlowType

Formik does not officially support Flow. However, there are community maintained types for Formik can be installed via `flow-typed`.
