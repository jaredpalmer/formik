# Contributing to Formik

1. Fork this repository to your own GitHub account and then clone it to your local device.
2. Install the dependencies: `yarn install`

## Working locally

### Watching / Building packages

```
yarn dev
```

### Unit testing

This will run `Jest` unit tests

```
yarn test
```

### Playground / Integration testing

There is a Next.js playground that also serves as the app used for integration tests. What's cool is you can run Formik's build setup, next.js, and cypress all at the same time and everything will just magically "work" and live reload whenever you make a change.
This is the suggested development workflow going forward.

1. From the root, open a terminal and run `yarn dev` to start [TSDX](https://tsdx.io) watch on all packages
2. Then start the playground app with `yarn start:app` in another terminal window (it will boot to http://localhost:3000)
3. And finally, you can open a third tab to run cypress
   - You can use Cypress UI using `yarn cypress:open`
   - Or, if you'd rather not deal GUI, just run `yarn cypress`
