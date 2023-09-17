# formik

## 2.4.5

### Patch Changes

- [`d7db9cd`](https://github.com/jaredpalmer/formik/commit/d7db9cddba9008714f2853013d5d4e82c8c94558) [#3860](https://github.com/jaredpalmer/formik/pull/3860) Thanks [@patik](https://github.com/patik)! - Add missing dependency `@types/hoist-non-react-statics`, closes #3837

* [`fe4ed7e`](https://github.com/jaredpalmer/formik/commit/fe4ed7e048b14331a75e40cabf48e4787d9b2b71) [#3501](https://github.com/jaredpalmer/formik/pull/3501) Thanks [@markspolakovs](https://github.com/markspolakovs)! - Mark `formik` as side-effect free in `package.json`

## 2.4.4

### Patch Changes

- [`41720c2`](https://github.com/jaredpalmer/formik/commit/41720c2f69407e41c27b325923bce63436b07f45) [#3862](https://github.com/jaredpalmer/formik/pull/3862) Thanks @yazaldefilimonepinto! - Forward `className` for custom components used with `Field`

- [`da58b29`](https://github.com/jaredpalmer/formik/commit/da58b292c9c0b6029ae21ab4b5edff09dd877c1b) [#3858](https://github.com/jaredpalmer/formik/pull/3858) Thanks @alaanescobedo! - Remove use of deprecated `StatelessComponent` type in favor of `FunctionComponent`

- [`5c01ee7`](https://github.com/jaredpalmer/formik/commit/5c01ee77b312ff6c375d43f841fe9fbe5846ebd9) [#3872](https://github.com/jaredpalmer/formik/pull/3872) Thanks @rajpatelbot! - FIX: Fixed resetForm function dependency issue

## 2.4.3

### Patch Changes

- [`9e0a661`](https://github.com/jaredpalmer/formik/commit/9e0a661513af75d1b848e5be7a4916c53b78760f) [#3843](https://github.com/jaredpalmer/formik/pull/3843) Thanks [@bonimba](https://github.com/bonimba)! - Fix FormikHelper and FieldHelperProps types

## 2.4.2

### Patch Changes

- [`96280d3`](https://github.com/jaredpalmer/formik/commit/96280d388eaa0f2e9fb84e7fd2aa45450de3a949) [#3817](https://github.com/jaredpalmer/formik/pull/3817) Thanks [@probablyup](https://github.com/probablyup)! - Updated internal types to support React 18.

## 2.4.1

### Patch Changes

- [`2b194c2`](https://github.com/jaredpalmer/formik/commit/2b194c287dc281ec2a8ff691d75c6b798ab5f70c) [#3808](https://github.com/jaredpalmer/formik/pull/3808) Thanks [@NagaiKoki](https://github.com/NagaiKoki)! - fix type of setFieldValue function

* [`708bcb2`](https://github.com/jaredpalmer/formik/commit/708bcb24785f1f8fbb5dfd649de3df4fddf7a113) [#3813](https://github.com/jaredpalmer/formik/pull/3813) Thanks [@probablyup](https://github.com/probablyup)! - Revert `FieldArray` "shouldComponentUpdate" performance optimization. As it turns out, it's a common use case to have JSX controlled via non-Formik state/props inside of `FieldArray`, so it's not safe to cancel re-renders here.

- [`187e47d`](https://github.com/jaredpalmer/formik/commit/187e47de0c4289cb279e25d69f8172cfa14369d2) [#3815](https://github.com/jaredpalmer/formik/pull/3815) Thanks [@probablyup](https://github.com/probablyup)! - Revert Yup transform support for the time being, this may be re-introduced in a future release under an opt-in prop.

## 2.4.0

### Minor Changes

- [`2f53b70`](https://github.com/jaredpalmer/formik/commit/2f53b70ef9c086a268330fa263390a2edd0164dd) [#3796](https://github.com/jaredpalmer/formik/pull/3796) Thanks [@probablyup](https://github.com/probablyup)! - Add support for Yup ["transforms"](https://github.com/jquense/yup#parsing-transforms).

## 2.3.3

### Patch Changes

- [`f075a0c`](https://github.com/jaredpalmer/formik/commit/f075a0cf8228c135ff71c58e139246ad24aae529) [#3798](https://github.com/jaredpalmer/formik/pull/3798) Thanks [@probablyup](https://github.com/probablyup)! - Fixed the use of generics for the `ArrayHelpers` type such that `any[]` is the default array type and for each individual method the array item type can be overridden if necessary.

## 2.3.2

### Patch Changes

- [`f086b5a`](https://github.com/jaredpalmer/formik/commit/f086b5a3bb6a155b4dc4ac3735c88805f9f5c4e4) [#3237](https://github.com/jaredpalmer/formik/pull/3237) Thanks [@pieplu](https://github.com/pieplu)! - Changed `getIn` to return undefined when it can't find a value AND a parent of that value is "falsy" ( "" / 0 / null / false )

* [`6d8f018`](https://github.com/jaredpalmer/formik/commit/6d8f018d7f52b863405b2e310be4b4195c2ba39c) [#3792](https://github.com/jaredpalmer/formik/pull/3792) Thanks [@probablyup](https://github.com/probablyup)! - Update the type for `setFieldValue` to reflect the returned `Promise` and potential returned error(s).

## 2.3.1

### Patch Changes

- [`290d92b`](https://github.com/jaredpalmer/formik/commit/290d92b34056593f551ad55baf00dc6f8c700bbe) [#3793](https://github.com/jaredpalmer/formik/pull/3793) Thanks [@probablyup](https://github.com/probablyup)! - Fix potential infinite loop scenario when `initialValues` changes but `enableReinitialize` is not truthy.

## 2.3.0

### Minor Changes

- [`73de78d`](https://github.com/jaredpalmer/formik/commit/73de78d169f0bc25bd84dff0beaed3cc7a2cbb11) [#3788](https://github.com/jaredpalmer/formik/pull/3788) Thanks [@probablyup](https://github.com/probablyup)! - Added typescript generics to `ArrayHelpers` interface and its methods so that users who use TypeScript can set the type for their arrays and have type safety on array utils. I have also gone ahead and made supplying a type for the generic optional for the sake of backwards compatibility so any existing TS code that does not give a type for the FieldArray will continue to work as they always have.

* [`39a7bf7`](https://github.com/jaredpalmer/formik/commit/39a7bf7ca31f2ef5b149a8ff02bab64667e19654) [#3786](https://github.com/jaredpalmer/formik/pull/3786) Thanks [@probablyup](https://github.com/probablyup)! - Yup by default only allows for cross-field validation within the
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
      nestedFieldWithRef: Yup.number()
        .min(0)
        .max(Yup.ref('object.nestedField')),
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
      nestedFieldWithRef: Yup.number()
        .min(0)
        .max(Yup.ref('$object.nestedField')),
    }),
  });
  ```

  With this change, you may now validate against any field in the entire schema,
  regardless of position when using the \$ prefix.

## 2.2.10

### Patch Changes

- [`22e236e`](https://github.com/jaredpalmer/formik/commit/22e236ed8035c7c5824232202c8ce52193338d5a) [#3784](https://github.com/jaredpalmer/formik/pull/3784) Thanks [@probablyup](https://github.com/probablyup)! - Improve performance of the `FieldArray` component by adding a `shouldComponentUpdate` check; this should help avoid unnecessary re-renders which may affect the performance of a form.

* [`bc9cb28`](https://github.com/jaredpalmer/formik/commit/bc9cb28df7ad07277a499e8301cfd1bb7b230b86) [#3785](https://github.com/jaredpalmer/formik/pull/3785) Thanks [@probablyup](https://github.com/probablyup)! - Fixed field error state for array fields that have an error and become empty through an API like `arrayHelpers.remove`.

  The prior behavior resolved the field error to `[undefined]`, now it is simply `undefined`.

- [`9cbf150`](https://github.com/jaredpalmer/formik/commit/9cbf150e65d7c5498900f19b4fa1897ca8a2c87f) [#3787](https://github.com/jaredpalmer/formik/pull/3787) Thanks [@probablyup](https://github.com/probablyup)! - Fix infinite loop issue in `Field` when field helpers (`setTouched`, etc) are used as an argument in `React.useEffect`.

* [`9c75a9f`](https://github.com/jaredpalmer/formik/commit/9c75a9f639eb38ad55c351e5e1def8a7e5ebd1f3) [#3780](https://github.com/jaredpalmer/formik/pull/3780) Thanks [@probablyup](https://github.com/probablyup)! - Fixed an issue with array field errors being incorrectly split into an array of individual characters instead of an array of error strings.

- [`35fa4cc`](https://github.com/jaredpalmer/formik/commit/35fa4cc38260d709a5570dd3c9ef82831758a5f5) [#3783](https://github.com/jaredpalmer/formik/pull/3783) Thanks [@probablyup](https://github.com/probablyup)! - Fix validation of deep.dot.path field references when using the `validateField` API.

## 2.2.9

### Patch Changes

- [`ca60ef9`](https://github.com/formium/formik/commit/ca60ef9517fdefdf928b627dd1c0039fe6febd5d) [#3227](https://github.com/formium/formik/pull/3227) Thanks [@johnrom](https://github.com/johnrom)! - Bump lodash and lodash-es to latest versions.

## 2.2.8

### Patch Changes

- [`3a9c707`](https://github.com/formium/formik/commit/3a9c707c8eec200d6eae2955536fb987daf38854) [#3203](https://github.com/formium/formik/pull/3203) Thanks [@hixus](https://github.com/hixus)! - Fixes type of setError value as it is same as setFieldError message

## 2.2.7

### Patch Changes

- [`e50040a`](https://github.com/formium/formik/commit/e50040abe49cf7bb46580ea46af6a2b487539830) [#2881](https://github.com/formium/formik/pull/2881) Thanks [@jinmayamashita](https://github.com/jinmayamashita)! - Prevent calling getSelectedValues when the element has not options

* [`31405ab`](https://github.com/formium/formik/commit/31405abfc9373b2236eecf0f34f630906579e193) [#3201](https://github.com/formium/formik/pull/3201) Thanks [@artola](https://github.com/artola)! - Fixes regression that resulted in error update race condition from when using `validateOnMount`

- [`c2d6926`](https://github.com/formium/formik/commit/c2d692659dc0c1ee43f7e9f60e18c36e0701eefe) [#2995](https://github.com/formium/formik/pull/2995) Thanks [@johnrom](https://github.com/johnrom)! - Allow explicitly setting `<form action>` to empty string (#2981). Note: previous code which passed an empty string would result in a noop (simply appending # to the url), but this will now result in a form submission to the current page.

## 2.2.6

### Patch Changes

- [`d4314a1`](https://github.com/formium/formik/commit/d4314a14cac4bfb0b2c2f1e5cf07a4fc3fb2d2d8) [#2955](https://github.com/formium/formik/pull/2955) Thanks [@jkbktl](https://github.com/jkbktl)! - fix(docs): fix link to docs in console warning

## 2.2.5

### Patch Changes

- [`ebad985`](https://github.com/formium/formik/commit/ebad98569e034c5bd8f52a7926480b7d63127cd4) [#2891](https://github.com/formium/formik/pull/2891) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Remove low-priority validation implementation

* [`0dfa23b`](https://github.com/formium/formik/commit/0dfa23b6b312db1f2c3d22019975212f0f901c00) [#2889](https://github.com/formium/formik/pull/2889) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Fixed botched typescript builds including scheduler types

## 2.2.4

### Patch Changes

- [`199e77a`](https://github.com/formium/formik/commit/199e77a3f69e9886d88fc7114c37769cd365d9c6) [#2882](https://github.com/formium/formik/pull/2882) Thanks [@umidbekkarimov](https://github.com/umidbekkarimov)! - Validate `setFieldTouched` with high priority

## 2.2.3

### Patch Changes

- [`e0a28e6`](https://github.com/formium/formik/commit/e0a28e6872ebfd06e636aac84829b60d704b0694) [#2867](https://github.com/formium/formik/pull/2867) Thanks [@umidbekkarimov](https://github.com/umidbekkarimov)! - Fix low priority validation for browser password autofill.

* [`958d67c`](https://github.com/formium/formik/commit/958d67ca2c3e006031c31150ea0a42248b28ffc7) [#2874](https://github.com/formium/formik/pull/2874) Thanks [@maddhruv](https://github.com/maddhruv)! - fix FastField initial value when input type is radio or checkbox

## 2.2.2

### Patch Changes

- [`00f95ec`](https://github.com/formium/formik/commit/00f95ec4ec5266eed8ad4e97b76321205c704d51) [#2854](https://github.com/formium/formik/pull/2854) Thanks [@umidbekkarimov](https://github.com/umidbekkarimov)! - Fix low priority validation race condition.

## 2.2.1

### Patch Changes

- [`e04886d`](https://github.com/formium/formik/commit/e04886db15c7e9b96516b4bd5a1b89d0e895bb7d) [#2820](https://github.com/formium/formik/pull/2820) Thanks [@wellyshen](https://github.com/wellyshen)! - Fixed bug with scheduler and `validateFormWithLowPriority` method not be scheduled correctly

## 2.2.0

### Minor Changes

- [`4148181`](https://github.com/formium/formik/commit/41481819f9187de79c4d948aeaa4ca1d33c53ed7) [#2794](https://github.com/formium/formik/pull/2794) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - `setValue` can now optionally accept a function as a callback, exposing `React.SetStateAction` functionality. Previously, only the entire object was
  allowed which caused issues with stale props.

  ```tsx
  setValues(prevValues => ({...prevValues, ... }))
  ```

## 2.1.7

### Patch Changes

- [`bda9f41`](https://github.com/formium/formik/commit/bda9f41931fac382eec26b4f1283b881b6bbc240) [#2785](https://github.com/formium/formik/pull/2785) Thanks [@jaredpalmer](https://github.com/jaredpalmer)! - Replace all instances of the deprecated React.SFC type with React.FC
